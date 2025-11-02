import User from "../models/user.js";
import Delivery from "../models/delivery.js";
import Return from "../models/return.js";

/**
 * Calculate workload for a user based on active assignments
 */
export const calculateUserWorkload = async (userId, userRole) => {
  try {
    let activeDeliveries = 0;
    let activeReturns = 0;
    let totalActive = 0;
    const activeStatuses = {
      delivery: ["packing", "ready_to_ship", "picked_up", "in_facility", "in_transit", "out_for_delivery"],
      return: ["pending", "assigned_support", "assigned_agency", "assigned_deliverer", "picked_up", "submitted_to_support", "in_inspection", "inspector_assigned", "refund_processing", "re_delivery"],
    };

    if (userRole === "delivery_agency") {
      // Count active deliveries assigned to this agency
      activeDeliveries = await Delivery.countDocuments({
        assignedDeliveryAgency: userId,
        status: { $in: activeStatuses.delivery },
      });
      // Count active returns assigned to this agency
      activeReturns = await Return.countDocuments({
        assignedDeliveryAgency: userId,
        returnStatus: { $in: activeStatuses.return },
      });
    } else if (userRole === "delivery_person") {
      // Count active deliveries assigned to this person
      activeDeliveries = await Delivery.countDocuments({
        assignedDeliveryPerson: userId,
        status: { $in: activeStatuses.delivery },
      });
      // Count active returns assigned to this person (if customer_return type)
      activeReturns = await Return.countDocuments({
        assignedReturnDeliverer: userId,
        returnStatus: { $in: activeStatuses.return },
      });
    } else if (userRole === "warehouse_operator") {
      // Count active deliveries assigned to this operator
      activeDeliveries = await Delivery.countDocuments({
        assignedWarehouseOperator: userId,
        status: { $in: activeStatuses.delivery },
      });
    } else if (userRole === "support" || userRole === "support_user") {
      // Support users see returns assigned to them
      if (userRole === "support_user") {
        activeReturns = await Return.countDocuments({
          assignedSupportUser: userId,
          returnStatus: { $in: activeStatuses.return },
        });
      } else {
        // Support admin sees all active returns
        activeReturns = await Return.countDocuments({
          returnStatus: { $in: activeStatuses.return },
        });
      }
    } else if (userRole === "verification_team") {
      // Count active returns assigned to this team
      activeReturns = await Return.countDocuments({
        assignedVerificationTeam: userId,
        returnStatus: { $in: activeStatuses.return },
      });
    } else if (userRole === "return_inspector") {
      // Count active returns assigned to this inspector
      activeReturns = await Return.countDocuments({
        assignedInspector: userId,
        returnStatus: { $in: activeStatuses.return },
      });
    } else if (userRole === "finance") {
      // Count active returns assigned to this finance user
      activeReturns = await Return.countDocuments({
        assignedFinance: userId,
        returnStatus: { $in: activeStatuses.return },
      });
    }

    totalActive = activeDeliveries + activeReturns;

    // Determine workload status
    let workloadStatus = "free"; // free, busy, occupied
    if (totalActive === 0) {
      workloadStatus = "free";
    } else if (totalActive <= 5) {
      workloadStatus = "busy";
    } else {
      workloadStatus = "occupied";
    }

    return {
      userId,
      userRole,
      activeDeliveries,
      activeReturns,
      totalActive,
      workloadStatus,
    };
  } catch (error) {
    console.error("Error calculating user workload:", error);
    throw error;
  }
};

/**
 * Get workload dashboard for a team admin
 * Shows all users under their management with workload status
 */
export const getWorkloadDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let users = [];
    let userQuery = {};

    // Build query based on admin role hierarchy
    if (userRole === "admin") {
      // Admin can see: delivery_agency, support, finance
      userQuery = { role: { $in: ["delivery_agency", "support", "finance"] } };
    } else if (userRole === "support") {
      // Support admin can see: support_user, verification_team
      userQuery = { role: { $in: ["support_user", "verification_team"] } };
    } else if (userRole === "delivery_agency") {
      // Delivery agency can see: warehouse_operator, delivery_person (assigned to them)
      userQuery = {
        $or: [
          { role: "warehouse_operator", deliveryAgencyId: userId },
          { role: "delivery_person", deliveryAgencyId: userId },
        ],
      };
    } else if (userRole === "verification_team") {
      // Verification team can see: return_inspector
      userQuery = { role: "return_inspector" };
    } else {
      return res.status(403).json({ message: "Unauthorized. Only team admins can view workload dashboard." });
    }

    // Get users
    users = await User.find(userQuery).select("fullName email role phone delivererType deliveryAgencyId");

    // Calculate workload for each user
    const workloadData = await Promise.all(
      users.map(async (user) => {
        try {
          const workload = await calculateUserWorkload(user._id, user.role);
          return {
            ...user.toObject(),
            workload,
          };
        } catch (error) {
          console.error(`Error calculating workload for user ${user._id}:`, error);
          return {
            ...user.toObject(),
            workload: {
              userId: user._id,
              userRole: user.role,
              activeDeliveries: 0,
              activeReturns: 0,
              totalActive: 0,
              workloadStatus: "unknown",
            },
          };
        }
      })
    );

    // Sort by workload status and total active
    workloadData.sort((a, b) => {
      const statusOrder = { free: 0, busy: 1, occupied: 2, unknown: 3 };
      if (statusOrder[a.workload.workloadStatus] !== statusOrder[b.workload.workloadStatus]) {
        return statusOrder[a.workload.workloadStatus] - statusOrder[b.workload.workloadStatus];
      }
      return b.workload.totalActive - a.workload.totalActive;
    });

    // Group by workload status
    const grouped = {
      free: workloadData.filter((u) => u.workload.workloadStatus === "free"),
      busy: workloadData.filter((u) => u.workload.workloadStatus === "busy"),
      occupied: workloadData.filter((u) => u.workload.workloadStatus === "occupied"),
      unknown: workloadData.filter((u) => u.workload.workloadStatus === "unknown"),
    };

    return res.json({
      workloadDashboard: workloadData,
      grouped,
      summary: {
        total: workloadData.length,
        free: grouped.free.length,
        busy: grouped.busy.length,
        occupied: grouped.occupied.length,
        unknown: grouped.unknown.length,
      },
    });
  } catch (error) {
    console.error("Error getting workload dashboard:", error);
    return res.status(500).json({ message: "Failed to get workload dashboard" });
  }
};

/**
 * Get workload for a specific user
 */
export const getUserWorkload = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId;
    const currentUserRole = req.userRole;

    // Get target user first
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Users can only view their own workload, or admins can view any user's workload
    if (String(targetUserId) !== String(currentUserId) && currentUserRole !== "admin") {
      // Also allow team admins to view their child users' workload
      let canView = false;
      if (currentUserRole === "support" && ["support_user", "verification_team"].includes(targetUser.role)) {
        canView = true;
      } else if (currentUserRole === "delivery_agency") {
        if (targetUser.role === "warehouse_operator" || (targetUser.role === "delivery_person" && String(targetUser.deliveryAgencyId) === String(currentUserId))) {
          canView = true;
        }
      } else if (currentUserRole === "verification_team" && targetUser.role === "return_inspector") {
        canView = true;
      }

      if (!canView) {
        return res.status(403).json({ message: "Unauthorized to view this user's workload" });
      }
    }

    const workload = await calculateUserWorkload(targetUserId, targetUser.role);

    return res.json({ workload });
  } catch (error) {
    console.error("Error getting user workload:", error);
    return res.status(500).json({ message: "Failed to get user workload" });
  }
};

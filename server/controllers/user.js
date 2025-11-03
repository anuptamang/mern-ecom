import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
// Environment variables are loaded by server/config/index.js
// No need to load dotenv here - it's already loaded when the server starts
const PORT = process.env.PORT || 3010;
import Order from "../models/order.js";
import Product from "../models/product.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "some very secret key",
      { expiresIn: "24h" }
    );

    // Calculate profile completion
    const completion = calculateProfileCompletion(existingUser);
    const isComplete = completion === 100 && (existingUser.role !== 'seller' || (existingUser.bankPayout && existingUser.bankPayout.accountNumber));
    
    // Update profileCompleted flag if complete
    if (isComplete && !existingUser.profileCompleted) {
      await User.findByIdAndUpdate(existingUser._id, {
        profileCompleted: true,
        profileCompletedAt: new Date()
      });
      existingUser.profileCompleted = true;
      existingUser.profileCompletedAt = new Date();
    }

    res.status(200).json({ 
      result: existingUser, 
      token,
      profileCompletion: completion,
      profileCompleted: existingUser.profileCompleted || isComplete
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const registration = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, role } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password doesn't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      role,
      password: hashedPassword,
      fullName: `${firstName} ${lastName}`,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      "some very secret key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      result: {
        _id: result._id,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Create a new user with specific role (role-based authorization hierarchy)
 * - Admin can create: delivery_agency, support, finance
 * - Support (support admin) can create: support_user, verification_team
 * - Verification team can create: return_inspector
 */
export const createUser = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { email, password, fullName, phone, role, delivererType, deliveryAgencyId } = req.body;

    // Validation
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ 
        message: "Email, password, fullName, and role are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Role-based authorization hierarchy
    let canCreate = false;
    let allowedRoles = [];

    if (userRole === "admin") {
      // Admin can create: delivery_agency, support, finance
      allowedRoles = ["delivery_agency", "support", "finance"];
      canCreate = allowedRoles.includes(role);
    } else if (userRole === "support") {
      // Support (support admin) can create: support_user, verification_team
      allowedRoles = ["support_user", "verification_team"];
      canCreate = allowedRoles.includes(role);
    } else if (userRole === "verification_team") {
      // Verification team can create: return_inspector
      allowedRoles = ["return_inspector"];
      canCreate = allowedRoles.includes(role);
    } else if (userRole === "delivery_agency") {
      // Delivery agency can create: warehouse_operator, delivery_person
      allowedRoles = ["warehouse_operator", "delivery_person"];
      canCreate = allowedRoles.includes(role);
    }

    if (!canCreate) {
      return res.status(403).json({ 
        message: `You are not authorized to create users with role '${role}'. ${userRole === "admin" ? "Admin can create: delivery_agency, support, finance" : userRole === "support" ? "Support can create: support_user, verification_team" : userRole === "verification_team" ? "Verification team can create: return_inspector" : userRole === "delivery_agency" ? "Delivery agency can create: warehouse_operator, delivery_person" : "Unauthorized"}` 
      });
    }

    // Validate delivererType for delivery_person role (this shouldn't happen in normal flow, but validate just in case)
    if (role === "delivery_person") {
      if (!delivererType || !["warehouse", "customer_delivery", "customer_return"].includes(delivererType)) {
        return res.status(400).json({ 
          message: "delivererType is required for delivery_person and must be 'warehouse', 'customer_delivery', or 'customer_return'" 
        });
      }
      if (!deliveryAgencyId) {
        return res.status(400).json({ 
          message: "deliveryAgencyId is required for delivery_person" 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      email,
      password: hashedPassword,
      fullName,
      phone: phone || undefined,
      role,
    };

    // Add delivererType if provided (for delivery_person)
    if (delivererType) {
      userData.delivererType = delivererType;
    }

    // Add deliveryAgencyId if provided (for delivery_person)
    if (deliveryAgencyId) {
      // Verify delivery agency exists
      const agency = await User.findById(deliveryAgencyId);
      if (!agency || agency.role !== "delivery_agency") {
        return res.status(400).json({ message: "Invalid delivery agency" });
      }
      userData.deliveryAgencyId = deliveryAgencyId;
    }

    const newUser = await User.create(userData);

    // Remove password from response
    const { password: _, ...userResponse } = newUser.toObject();

    return res.status(201).json({ 
      message: `User created successfully`,
      user: userResponse
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.remove();

  return res.json({ message: "User deleted" });
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const userId = req.userId;
    const profile = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user can only update their own profile
    if (String(userId) !== String(_id)) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    // Remove _id from update data (immutable field)
    const { _id: removedId, email: removedEmail, ...updateData } = profile;

    // Email is used as username/identifier and should not be changed
    // Prevent email updates for security
    if (profile.email) {
      console.warn(`Attempt to update email for user ${_id} - email updates are not allowed`);
    }

    // Validate required fields
    if (!updateData.fullName && Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "At least fullName must be provided" });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Recalculate profile completion
    const completion = calculateProfileCompletion(updatedProfile);
    const isComplete = completion === 100 && (updatedProfile.role !== 'seller' || (updatedProfile.bankPayout && updatedProfile.bankPayout.accountNumber));

    // Update profileCompleted flag if complete
    if (isComplete && !updatedProfile.profileCompleted) {
      await User.findByIdAndUpdate(_id, {
        profileCompleted: true,
        profileCompletedAt: new Date()
      });
      updatedProfile.profileCompleted = true;
      updatedProfile.profileCompletedAt = new Date();
    }

    // Remove password from response
    const { password, ...profileResponse } = updatedProfile.toObject();

    return res.json({
      ...profileResponse,
      profileCompletion: completion,
      profileCompleted: updatedProfile.profileCompleted || isComplete
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fullUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(id, { profilePhoto: fullUrl }, { new: true });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Failed to upload profile photo" });
  }
};

export const uploadCoverPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fullUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(id, { coverPhoto: fullUrl }, { new: true });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Failed to upload cover photo" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    const { role } = req.query; // Optional role filter
    
    // Only admin, support, support_user, verification_team, and delivery_agency roles can list users
    if (userRole !== "admin" && userRole !== "support" && userRole !== "support_user" && userRole !== "verification_team" && userRole !== "delivery_agency") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Build query based on role hierarchy
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    // Role-based filtering
    if (userRole === "support" || userRole === "support_user") {
      // Support can see support_user, verification_team, delivery_agency, and finance (for return workflow assignments)
      const allowedRoles = ["support_user", "verification_team", "delivery_agency", "finance"];
      if (role && !allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Unauthorized to view users of this role" });
      }
      if (!role) {
        // If no role filter, limit to allowed roles
        query.role = { $in: allowedRoles };
      }
    } else if (userRole === "verification_team") {
      // Verification team can only see return_inspector
      if (role && role !== "return_inspector") {
        return res.status(403).json({ message: "Unauthorized to view users of this role" });
      }
      if (!role) {
        query.role = "return_inspector";
      }
    } else if (userRole === "delivery_agency") {
      // Delivery agency can only see warehouse_operator and delivery_person assigned to them
      if (role && !["warehouse_operator", "delivery_person"].includes(role)) {
        return res.status(403).json({ message: "Unauthorized to view users of this role" });
      }
      if (!role) {
        // Show both warehouse_operator and delivery_person assigned to this agency
        query.$or = [
          { role: "warehouse_operator", deliveryAgencyId: userId },
          { role: "delivery_person", deliveryAgencyId: userId }
        ];
      } else {
        // Filter by role and agency
        query.deliveryAgencyId = userId;
      }
    } else if (userRole === "admin") {
      // Admin can see delivery_agency, support, finance
      if (role && !["delivery_agency", "support", "finance"].includes(role)) {
        return res.status(403).json({ message: "Unauthorized to view users of this role" });
      }
      if (!role) {
        query.role = { $in: ["delivery_agency", "support", "finance"] };
      }
    }
    
    const users = await User.find(query).select("fullName email role phone delivererType deliveryAgencyId");
    const privateFields = users.map((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    return res.json({ users: privateFields, count: privateFields.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const validateUser = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({ result: user });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const createNewPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 12);

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { password: hashedPassword },
        { new: true }
      );

      return res.status(200).json({ result: updatedUser });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

// Change password by user (requires old password)
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// Reset password by admin for child users
export const resetPassword = async (req, res) => {
  try {
    const adminId = req.userId;
    const adminRole = req.userRole;
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: "User ID and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Verify admin can reset password for this user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check authorization hierarchy
    let canReset = false;

    if (adminRole === "admin") {
      // Admin can reset: delivery_agency, support, finance
      canReset = ["delivery_agency", "support", "finance"].includes(targetUser.role);
    } else if (adminRole === "support") {
      // Support admin can reset: support_user, verification_team
      canReset = ["support_user", "verification_team"].includes(targetUser.role);
    } else if (adminRole === "verification_team") {
      // Verification team can reset: return_inspector
      canReset = targetUser.role === "return_inspector";
    } else if (adminRole === "delivery_agency") {
      // Delivery agency can reset: warehouse_operator, delivery_person (if assigned to them)
      if (["warehouse_operator", "delivery_person"].includes(targetUser.role)) {
        if (targetUser.role === "delivery_person") {
          // Verify delivery person belongs to this agency
          canReset = String(targetUser.deliveryAgencyId) === String(adminId);
        } else {
          canReset = true; // Warehouse operator
        }
      }
    }

    if (!canReset) {
      return res.status(403).json({ message: "You are not authorized to reset password for this user" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (user) => {
  if (!user) return 0;

  const fields = {
    basic: ['fullName', 'email', 'phone'],
    address: ['primaryAddress.street', 'primaryAddress.city', 'primaryAddress.state', 'primaryAddress.zipCode', 'primaryAddress.country'],
    profile: ['profilePhoto'],
  };

  let completedFields = 0;
  let totalFields = 0;

  // Basic fields
  fields.basic.forEach(field => {
    totalFields++;
    if (user[field]) completedFields++;
  });

  // Address fields
  fields.address.forEach(field => {
    totalFields++;
    const [parent, child] = field.split('.');
    if (user[parent] && user[parent][child]) completedFields++;
  });

  // Profile photo
  totalFields++;
  if (user.profilePhoto) completedFields++;

  // For sellers, also check bank payout info
  if (user.role === 'seller') {
    const bankFields = ['bankPayout.accountHolderName', 'bankPayout.accountNumber', 'bankPayout.bankName', 'bankPayout.routingNumber'];
    bankFields.forEach(field => {
      totalFields++;
      const [parent, child] = field.split('.');
      if (user[parent] && user[parent][child]) completedFields++;
    });
  }

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

// Get profile completion status
export const getProfileCompletion = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const completion = calculateProfileCompletion(user);
    const isComplete = completion === 100 && (user.role !== 'seller' || (user.bankPayout && user.bankPayout.accountNumber));

    // Update profileCompleted flag if complete
    if (isComplete && !user.profileCompleted) {
      await User.findByIdAndUpdate(userId, {
        profileCompleted: true,
        profileCompletedAt: new Date()
      });
    }

    return res.status(200).json({
      completion,
      isComplete,
      profileCompleted: user.profileCompleted || isComplete,
      requiredFields: {
        basic: ['fullName', 'email', 'phone'],
        address: ['primaryAddress'],
        profile: ['profilePhoto'],
        ...(user.role === 'seller' ? { bankPayout: ['bankPayout'] } : {})
      }
    });
  } catch (error) {
    console.error("Error getting profile completion:", error);
    return res.status(500).json({ message: "Failed to get profile completion" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const isSeller = user?.role === 'seller';
    
    const orders = await Order.find({ userId });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.amount / 100), 0);
    
    // Handle both string and ObjectId userID for backward compatibility
    const mongoose = (await import("mongoose")).default;
    const userProducts = await Product.find({
      $or: [
        { userID: userId },
        { userID: String(userId) },
        { userID: new mongoose.Types.ObjectId(userId) }
      ]
    });
    const totalProducts = userProducts.length;
    
    if (isSeller) {
      // Seller stats: orders containing seller's products
      const productIds = userProducts.map(p => p._id);
      const productIdStrings = productIds.map(id => String(id));
      
      if (productIds.length > 0) {
        const sellerOrders = await Order.find({
          "items.productId": { $in: productIds }
        });
        const totalSales = sellerOrders.length;
        const totalRevenue = sellerOrders.reduce((sum, order) => {
          const sellerItems = order.items.filter(item => 
            productIdStrings.includes(String(item.productId))
          );
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);
        
        // Count items in carts
        const Cart = (await import("../models/cart.js")).default;
        const cartsWithSellerProducts = await Cart.find({
          "items.productId": { $in: productIds }
        });
        const cartItemsCount = cartsWithSellerProducts.reduce((count, cart) => {
          return count + cart.items.filter(item => 
            productIdStrings.includes(String(item.productId))
          ).length;
        }, 0);
      
        return res.json({ 
          totalOrders, 
          totalSpent, 
          totalProducts, 
          totalSales,
          totalRevenue,
          cartItemsCount
        });
      } else {
        return res.json({ 
          totalOrders, 
          totalSpent, 
          totalProducts, 
          totalSales: 0,
          totalRevenue: 0,
          cartItemsCount: 0
        });
      }
    } else {
      // Buyer stats
      const totalSales = orders.filter(o => userProducts.some(p => String(p._id) === String(o.items?.[0]?.productId))).length;
      return res.json({ totalOrders, totalSpent, totalProducts, totalSales });
    }
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
};

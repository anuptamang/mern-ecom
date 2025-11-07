/**
 * Role-Based Access Control (RBAC) Permissions Configuration
 *
 * Defines permissions for each role in the system.
 *
 * Permission format:
 * - '*' means all actions are allowed
 * - Array of specific actions: ['create', 'read', 'update', 'delete']
 *
 * Security Principle: "Least Privilege" - Users only get minimum permissions needed
 */

export const rolePermissions = {
  // Admin has access to everything
  admin: {
    "*": ["*"], // All resources, all actions
  },

  // Buyer (user) permissions
  user: {
    products: ["read"], // Can only read products
    orders: ["create", "read"], // Can create and read own orders
    carts: ["create", "read", "update", "delete"], // Full cart management
    wishlist: ["create", "read", "update", "delete"], // Full wishlist management
    returns: ["create", "read", "delete"], // Can create return requests, read own returns, and cancel returns
    deliveries: ["read", "update"], // Can read and update (cancel) their own deliveries
    chat: ["create", "read"], // Can send and read messages
    user: ["read", "update", "delete"], // Can read, update, and delete own profile (delete for notifications)
  },

  // Seller permissions
  seller: {
    products: ["create", "read", "update", "delete"], // Full product management
    orders: ["read", "update"], // Can read and update orders (mark ready to ship)
    payouts: ["read"], // Can read payout information
    chat: ["create", "read"], // Can send and read messages
    user: ["read", "update"], // Can read and update own profile
  },

  // Delivery Agency permissions
  delivery_agency: {
    deliveries: ["read", "update", "assign"], // Can read, update, and assign deliveries
    orders: ["read"], // Can read order information for deliveries
    user: ["read", "update", "create"], // Can read, update, and create child users
  },

  // Delivery Person permissions
  delivery_person: {
    deliveries: ["read", "update"], // Can read and update assigned deliveries
    orders: ["read"], // Can read order information for deliveries
    user: ["read", "update"], // Can read and update own profile
  },

  // Warehouse Operator permissions
  warehouse_operator: {
    deliveries: ["read", "update", "assign"], // Can read, update, and assign deliveries
    orders: ["read"], // Can read order information
    user: ["read", "update"], // Can read and update own profile
  },

  // Support Admin permissions
  support: {
    returns: ["read", "update", "assign"], // Can read, update, and assign returns
    orders: ["read"], // Can read order information
    user: ["read", "update", "create"], // Can read, update, and create child users
    chat: ["read"], // Can read chat messages for support
  },

  // Support User permissions
  support_user: {
    returns: ["read", "update", "assign"], // Can read, update, and assign returns
    orders: ["read"], // Can read order information
    user: ["read", "update"], // Can read and update own profile
    chat: ["read"], // Can read chat messages for support
  },

  // Verification Team permissions
  verification_team: {
    returns: ["read", "update", "assign"], // Can read, update, and assign returns
    user: ["read", "update", "create"], // Can read, update, and create inspectors
  },

  // Return Inspector permissions
  return_inspector: {
    returns: ["read", "update"], // Can read and update returns for inspection
    user: ["read", "update"], // Can read and update own profile
  },

  // Return Deliverer permissions
  return_deliverer: {
    returns: ["read", "update"], // Can read and update return deliveries
    orders: ["read"], // Can read order information
    user: ["read", "update"], // Can read and update own profile
  },

  // Finance permissions
  finance: {
    returns: ["read", "update"], // Can read and update returns for refund processing
    payouts: ["read", "update"], // Can read and update payouts
    orders: ["read"], // Can read order information
    user: ["read", "update"], // Can read and update own profile
  },
};

/**
 * Get permissions for a specific role
 * @param {string} role - User role
 * @returns {Object} Permissions object
 */
export const getRolePermissions = (role) => {
  return rolePermissions[role] || {};
};

/**
 * Check if a role has permission for a resource/action
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {boolean} True if permission is granted
 */
export const hasPermission = (role, resource, action) => {
  // Admin has all permissions
  if (role === "admin") {
    return true;
  }

  const permissions = rolePermissions[role];
  if (!permissions) {
    return false;
  }

  // Check if resource has wildcard permission
  if (permissions["*"] && permissions["*"].includes("*")) {
    return true;
  }

  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) {
    return false;
  }

  // Check if action is allowed (wildcard or specific)
  return (
    resourcePermissions.includes("*") || resourcePermissions.includes(action)
  );
};

export default {
  rolePermissions,
  getRolePermissions,
  hasPermission,
};

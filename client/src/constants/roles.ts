/**
 * User role constants
 * Used for role-based access control and filtering
 */

export const ROLES = {
  // User Roles
  BUYER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',

  // Delivery Roles
  DELIVERY_AGENCY: 'delivery_agency',
  DELIVERY_PERSON: 'delivery_person',
  WAREHOUSE_OPERATOR: 'warehouse_operator',

  // Support Roles
  SUPPORT: 'support',
  SUPPORT_USER: 'support_user',

  // Verification Roles
  VERIFICATION_TEAM: 'verification_team',
  RETURN_INSPECTOR: 'return_inspector',

  // Other Roles
  RETURN_DELIVERER: 'return_deliverer',
  FINANCE: 'finance',
} as const;

/**
 * Check if a role is a delivery-related role
 */
export const isDeliveryRole = (role: string | undefined): boolean => {
  if (!role) return false;
  return [
    ROLES.DELIVERY_AGENCY,
    ROLES.DELIVERY_PERSON,
    ROLES.WAREHOUSE_OPERATOR,
    ROLES.SUPPORT,
    ROLES.SUPPORT_USER,
    ROLES.VERIFICATION_TEAM,
    ROLES.RETURN_INSPECTOR,
    ROLES.RETURN_DELIVERER,
    ROLES.FINANCE,
    ROLES.ADMIN,
  ].includes(role as any);
};

/**
 * Check if a user can access products
 */
export const canAccessProducts = (role: string | undefined): boolean => {
  if (!role) return true; // Public users can access
  return [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN].includes(role as any);
};

/**
 * Check if a user can see hero banner
 */
export const canSeeHeroBanner = (role: string | undefined): boolean => {
  if (!role) return true; // Public users can see
  return [ROLES.BUYER, ROLES.SELLER].includes(role as any);
};

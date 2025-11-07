/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Enterprise-grade authorization based on user roles and permissions.
 * Implements the Principle of Least Privilege - users can only access
 * resources and perform actions they are explicitly permitted to.
 * 
 * Security Principle: "Deny by default" - Access is denied unless explicitly allowed
 */

import { logger } from '../utils/index.js';
import { rolePermissions } from '../config/rolePermissions.js';

/**
 * Check if user has required role(s) for the action
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.userId || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'User not authenticated',
        });
      }

      // Normalize allowedRoles to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Admin has access to everything
      if (req.userRole === 'admin') {
        return next();
      }

      // Check if user's role is in allowed roles
      if (!roles.includes(req.userRole)) {
        logger.warn('Role-based access denied', {
          userId: req.userId,
          userRole: req.userRole,
          requiredRoles: roles,
          path: req.path,
          method: req.method,
        });

        return res.status(403).json({
          success: false,
          message: 'Forbidden - Insufficient permissions',
          error: `This action requires one of the following roles: ${roles.join(', ')}`,
          userRole: req.userRole,
        });
      }

      // User has required role
      next();
    } catch (error) {
      logger.error('Error in role-based access control', {
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Authorization check failed',
      });
    }
  };
};

/**
 * Check if user has required permission for a specific resource/action
 * @param {string} resource - Resource name (e.g., 'products', 'orders')
 * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns {Function} Express middleware
 */
export const requirePermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.userId || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'User not authenticated',
        });
      }

      // Admin has access to everything
      if (req.userRole === 'admin') {
        return next();
      }

      // Get permissions for user's role
      const permissions = rolePermissions[req.userRole];
      
      if (!permissions) {
        logger.warn('No permissions defined for role', {
          userId: req.userId,
          userRole: req.userRole,
        });

        return res.status(403).json({
          success: false,
          message: 'Forbidden - No permissions defined for your role',
          error: 'Contact administrator',
        });
      }

      // Check if resource exists in permissions
      const resourcePermissions = permissions[resource];
      
      if (!resourcePermissions) {
        logger.warn('Resource not found in permissions', {
          userId: req.userId,
          userRole: req.userRole,
          resource,
        });

        return res.status(403).json({
          success: false,
          message: 'Forbidden - Access denied to this resource',
          error: `No access to ${resource}`,
        });
      }

      // Check if action is allowed
      if (!resourcePermissions.includes(action) && !resourcePermissions.includes('*')) {
        logger.warn('Action not permitted', {
          userId: req.userId,
          userRole: req.userRole,
          resource,
          action,
        });

        return res.status(403).json({
          success: false,
          message: 'Forbidden - Action not permitted',
          error: `Cannot ${action} ${resource}`,
        });
      }

      // User has required permission
      next();
    } catch (error) {
      logger.error('Error in permission check', {
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Permission check failed',
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 * This is a convenience wrapper around requireRole(['admin'])
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is seller
 */
export const requireSeller = requireRole(['seller']);

/**
 * Middleware to check if user is buyer
 */
export const requireBuyer = requireRole(['user']);

/**
 * Middleware to allow multiple roles
 * @param {string[]} roles - Array of allowed roles
 */
export const requireAnyRole = requireRole;

export default {
  requireRole,
  requirePermission,
  requireAdmin,
  requireSeller,
  requireBuyer,
  requireAnyRole,
};

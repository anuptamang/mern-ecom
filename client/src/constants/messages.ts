/**
 * Centralized message constants for UI feedback
 * Used for toast notifications, alerts, and user feedback
 */

export const MESSAGES = {
  // Success Messages
  SUCCESS: {
    DELIVERY_STATUS_UPDATED: 'Delivery status updated successfully',
    PRODUCT_ADDED_TO_CART: (productName: string) =>
      `${productName} added to cart`,
    VOUCHER_CODE_COPIED: (code: string) =>
      `Voucher code "${code}" copied to clipboard!`,
    WELCOME_BACK: 'Welcome back!',
    PROFILE_UPDATED: 'Profile updated successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    RETURN_REQUESTED: 'Return request submitted successfully',
  },

  // Error Messages
  ERROR: {
    GENERIC_ERROR: (action: string) => `Failed to ${action}`,
    FAILED_TO_COPY_VOUCHER: 'Failed to copy voucher code',
    FAILED_TO_LOAD_DELIVERY_PERSONS: 'Failed to load delivery persons',
    FAILED_TO_UPDATE_DELIVERY_STATUS: 'Failed to update delivery status',
    FAILED_TO_LOAD_WORKLOAD_DASHBOARD: 'Failed to load workload dashboard',
    FAILED_TO_ADD_TO_CART: 'Failed to add product to cart',
    FAILED_TO_SEND_MESSAGE: 'Failed to send message',
    AUTHENTICATION_REQUIRED: 'Authentication required',
    PRODUCT_OUT_OF_STOCK: 'Product is out of stock',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },

  // Warning Messages
  WARNING: {
    SELLERS_CANNOT_PURCHASE: 'Sellers cannot purchase products',
    SELECT_CUSTOMER_DELIVERER:
      'Please select a customer deliverer when updating status to "Out for Delivery"',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    ACCOUNT_INVALID: 'Your account is no longer valid. Please log in again.',
  },

  // Info Messages
  INFO: {
    LOADING: 'Loading...',
    NO_DATA: 'No data available',
    NO_PRODUCTS: 'No products found',
    NO_ORDERS: 'No orders found',
  },
} as const;

/**
 * Banner-related constants
 * Used for hero banner slider configuration and content
 */

export const BANNER_CONFIG = {
  // Swiper Configuration
  SWIPER: {
    DELAY: 5000,
    DISABLE_ON_INTERACTION: false,
    DEFAULT_MIN_HEIGHT: 600,
    RECALCULATE_DELAY: 100,
    COPY_CODE_TIMEOUT: 3000,
  },

  // Banner Slide Types
  SLIDE_TYPES: {
    OFFER: 'offer',
    VOUCHER: 'voucher',
    COMING_SOON: 'coming-soon',
    FEATURED: 'featured',
    BANNER: 'banner',
  },

  // Banner Slide Default Colors
  COLORS: {
    DEFAULT_BACKGROUND: '#1890ff',
    DEFAULT_TEXT: '#fff',
    OFFER: '#ff6b6b',
    VOUCHER: '#4ecdc4',
    FEATURED: '#45b7d1',
    COMING_SOON: '#f39c12',
    BANNER: '#9b59b6',
    FLASH_SALE: '#e74c3c',
  },

  // Banner Slide Default Routes
  ROUTES: {
    PRODUCTS: '/products',
  },
} as const;

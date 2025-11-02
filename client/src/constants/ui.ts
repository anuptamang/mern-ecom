/**
 * UI-related constants
 * Used for component styling, dimensions, and UI configuration
 */

export const UI = {
  // Header Configuration
  HEADER: {
    HEIGHT: 64,
    HEIGHT_PX: '64px',
    Z_INDEX: 1000,
  },

  // Layout Configuration
  LAYOUT: {
    CONTENT_PADDING: 24,
    CONTENT_PADDING_PX: '24px',
    FOOTER_HEIGHT: 'auto',
  },

  // Common Dimensions
  DIMENSIONS: {
    BORDER_RADIUS: {
      SMALL: '4px',
      MEDIUM: '8px',
      LARGE: '12px',
      ROUND: '50%',
    },
    SPACING: {
      XS: '4px',
      SM: '8px',
      MD: '12px',
      LG: '16px',
      XL: '24px',
      XXL: '32px',
    },
  },

  // Breakpoints (matching common breakpoints)
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE_DESKTOP: 1440,
  },

  // Animation Durations (ms)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Selector Class Names (for DOM queries)
  SELECTORS: {
    BANNER_SLIDE: '.banner-slide',
    HERO_SWIPER: '.hero-swiper',
  },
} as const;

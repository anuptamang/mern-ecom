module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{html,js,ts,tsx,jsx}'],
    options: {
      whitelist: [
        '[class^="icon-"]',
        '[class*="icon-"]',
        '::selection',
        '::-moz-selection',
        '[class^="aspect-ratio-"]',
      ],
    },
  },
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1540px',
    },

    extend: {
      // Use CSS variables for theme colors - these will be injected by ThemeProvider
      colors: {
        // Theme colors - use CSS variables with fallbacks
        primary: 'var(--theme-primary, #0071e3)',
        'primary-light': 'var(--theme-primary-light, #007aff)',
        'primary-dark': 'var(--theme-primary-dark, #0066cc)',
        'primary-bg': 'var(--theme-primary-bg, #f0f8ff)',
        
        secondary: 'var(--theme-secondary, #6e6e73)',
        'secondary-light': 'var(--theme-secondary-light, #86868b)',
        'secondary-dark': 'var(--theme-secondary-dark, #424245)',
        
        success: 'var(--theme-success, #34c759)',
        warning: 'var(--theme-warning, #ff9500)',
        error: 'var(--theme-error, #ff3b30)',
        info: 'var(--theme-info, #0071e3)',
        
        link: 'var(--theme-link, #0071e3)',
        'link-hover': 'var(--theme-link-hover, #007aff)',
        
        text: 'var(--theme-text, #1d1d1f)',
        'text-secondary': 'var(--theme-text-secondary, #6e6e73)',
        'text-tertiary': 'var(--theme-text-tertiary, #86868b)',
        'text-inverse': 'var(--theme-text-inverse, #ffffff)',
        
        background: 'var(--theme-background, #ffffff)',
        'background-secondary': 'var(--theme-background-secondary, #fafafa)',
        'background-tertiary': 'var(--theme-background-tertiary, #f5f5f5)',
        
        border: 'var(--theme-border, #d1d1d1)',
        'border-light': 'var(--theme-border-light, #e5e5e5)',
        'border-dark': 'var(--theme-border-dark, #86868b)',
        
        // Header colors
        'header-bg': 'var(--theme-header-background, #ffffff)',
        'header-text': 'var(--theme-header-text, #1d1d1f)',
        'header-border': 'var(--theme-header-border, rgba(0, 0, 0, 0.08))',
        
        // Footer colors
        'footer-bg': 'var(--theme-footer-background, #f5f5f5)',
        'footer-text': 'var(--theme-footer-text, #6e6e73)',
        'footer-text-secondary': 'var(--theme-footer-text-secondary, rgba(110, 110, 115, 0.7))',
        'footer-border': 'var(--theme-footer-border, rgba(0, 0, 0, 0.08))',
        
        // Button colors
        'button-primary': 'var(--theme-button-primary, #0071e3)',
        'button-primary-hover': 'var(--theme-button-primary-hover, #007aff)',
        'button-secondary': 'var(--theme-button-secondary, #6e6e73)',
        'button-danger': 'var(--theme-button-danger, #ff3b30)',
        
        // Card colors
        'card-bg': 'var(--theme-card-background, #ffffff)',
        'card-border': 'var(--theme-card-border, #e5e5e5)',
        'card-shadow': 'var(--theme-card-shadow, rgba(0, 0, 0, 0.08))',
        'card-hover-shadow': 'var(--theme-card-hover-shadow, rgba(0, 0, 0, 0.12))',
        
        // Neutral colors
        white: 'var(--theme-white, #ffffff)',
        black: 'var(--theme-black, #000000)',
        dark: 'var(--theme-dark, #1d1d1f)',
        
        // Gray scale - use CSS variables
        gray: {
          50: 'var(--theme-gray-50, #fafafa)',
          100: 'var(--theme-gray-100, #f5f5f5)',
          200: 'var(--theme-gray-200, #e5e5e5)',
          300: 'var(--theme-gray-300, #d1d1d1)',
          400: 'var(--theme-gray-400, #86868b)',
          500: 'var(--theme-gray-500, #6e6e73)',
          600: 'var(--theme-gray-600, #424245)',
          700: 'var(--theme-gray-700, #333336)',
          800: 'var(--theme-gray-800, #1d1d1f)',
          900: 'var(--theme-gray-900, #000000)',
        },
        
        // Accent colors
        accent: 'var(--theme-accent, #0071e3)',
        'accent-hover': 'var(--theme-accent-hover, #007aff)',
        
        // Legacy colors - keep for backward compatibility but use theme variables where possible
        light: {
          100: 'rgba(255,255,255,0.5)',
        },
        purple: '#8d0fda', // Keep as is - not part of theme system
        green: {
          200: '#a99f24',
          300: '#D1F584',
          400: 'var(--theme-success, #1EBA42)', // Map to success
          500: '#189535',
        },
        orange: {
          600: '#fcd376',
        },
        blue: {
          100: 'rgba(70, 118, 159, 0.2)',
          200: 'rgba(154, 209, 255, 0.5)',
          400: '#328EDC',
          500: 'var(--theme-primary, #11a9f0)', // Map to primary
          600: '#32a0d9',
          800: '#001529',
        },
        brown: {
          500: '#B87937',
          600: '#93612C',
        },
        red: {
          300: '#f47527',
          500: 'var(--theme-error, #de1d1d)', // Map to error
          600: '#ff004e',
        },
      },
      fontFamily: {
        // Use theme font family with fallback
        sans: [
          'var(--theme-body-font-family, Mulish)',
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        roboto: [
          'Roboto',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        times: ['Times New Roman', 'Georgia', 'serif'],
        'awesome-pro': ["'Font Awesome 6 Pro'"],
      },
      fontSize: {
        0: ['0', { lineHeight: '0' }],
        xs: ['12px', '140%'],
        sm: ['14px', '140%'],
        base: ['16px', '140%'],
        lg: ['18px', '160%'],
        xl: ['20px', '140%'],
      },
      backgroundImage: {
        overlay:
          'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0.65) 100%)',
        'brand-gradient':
          'linear-gradient(90deg, rgba(141,15,218,0.3) 0%, rgba(141,15,218,0.3) 33%, rgba(50,160,217,0.3) 72%)',
      },
      opacity: {
        0: '0',
        20: '0.2',
        40: '0.4',
        60: '0.6',
        80: '0.8',
        100: '1',
      },
      borderRadius: {
        '4xl': '50px',
      },
      boxShadow: {
        sm: '4px 3px 30px rgba(12, 60, 131, 0.15)',
        md: '4px 3px 60px rgba(45, 59, 83, 0.15)',
        lg: 'var(--theme-card-shadow, 8px 6px 60px rgba(13, 32, 66, 0.07))',
        xl: 'var(--theme-card-hover-shadow, 10px 8px 51px rgba(0, 0, 0, 0.3))',
        'theme': 'var(--theme-card-shadow, rgba(0, 0, 0, 0.08))',
        'theme-hover': 'var(--theme-card-hover-shadow, rgba(0, 0, 0, 0.12))',
      },
      zIndex: {
        1: '1',
        '-1': '-1',
      },
      animation: {
        slideDown: 'slideDown 0.5s forwards',
        slideUp: 'slideUp 0.5s forwards',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
    },
  },
  variants: {
    appearance: [],
  },
  corePlugins: {
    preflight: false,
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};

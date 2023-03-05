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
      // to add new values and keep default
      colors: {
        white: '#fff',
        black: {
          100: '#b1b1b1',
          200: '#7f858e',
          300: '#4a4d51',
          400: '#707378',
          500: '#5b5f69',
          600: '#333',
          700: '#1f1f1f',
          800: '#000',
          900: '#171a22',
        },
        dark: {
          100: '#b1b1b1',
          200: '#62656f',
          300: '#91959d',
          400: '#95979b',
          500: '#000407',
          600: '#373737',
          700: '#282a2c',
          800: '#282b30',
          900: '#171a22',
        },
        light: {
          100: 'rgba(255,255,255,0.5)',
        },
        purple: '#8d0fda',
        green: {
          200: '#a99f24',
          300: '#D1F584',
          400: '#1EBA42',
          500: '#189535',
        },
        orange: {
          600: '#fcd376',
        },
        blue: {
          100: 'rgba(70, 118, 159, 0.2)',
          200: 'rgba(154, 209, 255, 0.5)',
          400: '#328EDC',
          500: '#11a9f0',
          600: '#32a0d9',
        },
        gray: {
          100: '#eff2f7',
          200: '#c4cacf',
          300: '#dfe1e6',
          400: '#D9D9D9',
          500: '#bdc5cb',
          600: '#b6bccc',
          700: '#6a6f78',
          800: '#787b80',
          900: '#474849',
        },
        brown: {
          500: '#B87937',
          600: '#93612C',
        },
        red: {
          300: '#f47527',
          500: '#de1d1d',
          600: '#ff004e',
        },
      },
      fontFamily: {
        sans: [
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
        lg: '8px 6px 60px rgba(13, 32, 66, 0.07)',
        xl: '10px 8px 51px rgba(0, 0, 0, 0.3)',
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

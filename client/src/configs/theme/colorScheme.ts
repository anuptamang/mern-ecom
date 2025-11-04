/**
 * Centralized Color Scheme Configuration
 *
 * This file contains all color definitions used throughout the application.
 * Modify colors here to update the entire application theme.
 *
 * Colors can be updated via:
 * 1. Direct editing of this file
 * 2. Admin panel (if implemented)
 * 3. Backend API (if implemented)
 */

export interface ColorScheme {
  // Primary Colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryBg: string;

  // Secondary Colors
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;

  // Accent Colors
  accent: string;
  accentHover: string;

  // Semantic Colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Neutral Colors
  white: string;
  black: string;
  dark: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Background Colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text Colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border Colors
  border: string;
  borderLight: string;
  borderDark: string;

  // Header Colors
  header: {
    background: string;
    backgroundGradient: string[];
    text: string;
    border: string;
  };

  // Footer Colors
  footer: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };

  // Banner Colors
  banner: {
    background: string;
    text: string;
    offer: string;
    voucher: string;
    featured: string;
    comingSoon: string;
    flashSale: string;
  };

  // Button Colors
  button: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    danger: string;
    dangerHover: string;
  };

  // Link Colors
  link: string;
  linkHover: string;

  // Card Colors
  card: {
    background: string;
    border: string;
    shadow: string;
    hoverShadow: string;
  };

  // Navigation/Menu Colors
  nav: {
    itemColor: string;
    itemHoverColor: string;
    itemActiveColor: string;
    itemActiveBg: string;
  };

  // Logo Configuration
  logo: {
    imageUrl: string | null;
    text: string | null;
    iconColor: string;
    textColor: string;
  };

  // Body Text Configuration
  bodyText: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
}

/**
 * Default Color Scheme - Inspired by Apple.com
 *
 * This is the fallback color scheme used when:
 * 1. Admin hasn't configured custom colors via admin panel
 * 2. Failed to load custom colors from backend
 * 3. User hasn't set custom preferences
 *
 * Apple.com design principles:
 * - Clean whites and light grays
 * - Subtle, minimal shadows
 * - High contrast text for readability
 * - Signature blue for primary actions
 * - Elegant and minimalist aesthetic
 */
export const defaultColorScheme: ColorScheme = {
  // Primary Colors - Apple's signature blue
  primary: '#0071e3', // Apple's primary blue
  primaryDark: '#0066cc', // Darker blue for hover
  primaryLight: '#007aff', // iOS blue variant
  primaryBg: '#f0f8ff', // Very light blue background

  // Secondary Colors - Subtle grays
  secondary: '#6e6e73', // Apple's secondary gray
  secondaryDark: '#424245', // Darker gray
  secondaryLight: '#86868b', // Lighter gray

  // Accent Colors - Apple's accent blue
  accent: '#0071e3', // Same as primary for consistency
  accentHover: '#007aff', // Lighter on hover

  // Semantic Colors - Apple's semantic palette
  success: '#34c759', // Apple green
  warning: '#ff9500', // Apple orange
  error: '#ff3b30', // Apple red
  info: '#0071e3', // Apple blue

  // Neutral Colors - Apple's neutral palette
  white: '#ffffff',
  black: '#000000',
  dark: '#1d1d1f', // Apple's dark background
  gray: {
    50: '#fafafa', // Very light gray
    100: '#f5f5f5', // Light gray background
    200: '#e5e5e5', // Light border gray
    300: '#d1d1d1', // Medium light gray
    400: '#86868b', // Medium gray
    500: '#6e6e73', // Apple's standard gray
    600: '#424245', // Dark gray text
    700: '#333336', // Darker gray
    800: '#1d1d1f', // Apple's dark gray
    900: '#000000', // Pure black
  },

  // Background Colors - Apple's clean backgrounds
  background: '#ffffff', // Pure white
  backgroundSecondary: '#fafafa', // Apple's light background
  backgroundTertiary: '#f5f5f5', // Slightly darker background

  // Text Colors - Apple's high contrast text
  text: '#1d1d1f', // Apple's primary text color (very dark gray)
  textSecondary: '#6e6e73', // Apple's secondary text
  textTertiary: '#86868b', // Lighter secondary text
  textInverse: '#ffffff', // White text for dark backgrounds

  // Border Colors - Apple's subtle borders
  border: '#d1d1d1', // Apple's border gray
  borderLight: '#e5e5e5', // Lighter border
  borderDark: '#86868b', // Darker border

  // Header Colors - Apple's minimal header
  header: {
    background: '#ffffff', // White header
    backgroundGradient: ['#ffffff', '#fafafa'], // Subtle gradient
    text: '#1d1d1f', // Dark text
    border: 'rgba(0, 0, 0, 0.08)', // Very subtle border
  },

  // Footer Colors - Apple's clean footer
  footer: {
    background: '#f5f5f5', // Light gray background
    text: '#6e6e73', // Medium gray text
    textSecondary: 'rgba(110, 110, 115, 0.7)', // Lighter gray
    border: 'rgba(0, 0, 0, 0.08)', // Subtle border
  },

  // Banner Colors - Apple-inspired banner colors
  banner: {
    background: '#0071e3', // Apple blue
    text: '#ffffff', // White text
    offer: '#ff3b30', // Apple red for offers
    voucher: '#34c759', // Apple green for vouchers
    featured: '#0071e3', // Apple blue for featured
    comingSoon: '#ff9500', // Apple orange
    flashSale: '#ff3b30', // Apple red for flash sales
  },

  // Button Colors - Apple's button styles
  button: {
    primary: '#0071e3', // Apple blue
    primaryHover: '#007aff', // Lighter blue on hover
    secondary: '#6e6e73', // Gray secondary button
    secondaryHover: '#86868b', // Lighter gray on hover
    danger: '#ff3b30', // Apple red
    dangerHover: '#ff453a', // Slightly lighter red
  },

  // Link Colors - Apple's link blue
  link: '#0071e3', // Apple blue
  linkHover: '#007aff', // Lighter blue on hover

  // Card Colors - Apple's clean card design
  card: {
    background: '#ffffff', // White cards
    border: '#e5e5e5', // Subtle border
    shadow: 'rgba(0, 0, 0, 0.08)', // Apple's subtle shadow
    hoverShadow: 'rgba(0, 0, 0, 0.12)', // Slightly darker on hover
  },

  // Navigation/Menu Colors
  nav: {
    itemColor: '#1d1d1f', // Default nav item color
    itemHoverColor: '#0071e3', // Hover color (primary)
    itemActiveColor: '#0071e3', // Active item color (primary)
    itemActiveBg: 'transparent', // Active item background
  },

  // Logo Configuration
  logo: {
    imageUrl: null as string | null, // Custom logo image URL
    text: null as string | null, // Custom logo text (null = use site title)
    iconColor: '#0071e3', // Logo icon color
    textColor: '#1d1d1f', // Logo text color
  },

  // Body Text Configuration
  bodyText: {
    fontFamily: 'Mulish, sans-serif',
    fontSize: 16,
    lineHeight: 1.5,
    color: '#1d1d1f',
  },
};

/**
 * Fallback Color Scheme
 * These are the default values that will always be used if:
 * 1. Admin hasn't configured colors via admin panel
 * 2. Failed to load custom colors from backend API
 * 3. LocalStorage is corrupted or unavailable
 *
 * This ensures the application always has valid colors to use.
 */
export const fallbackColorScheme: ColorScheme = { ...defaultColorScheme };

/**
 * Current Color Scheme
 * This can be updated from:
 * 1. Admin panel settings (via backend API)
 * 2. Local storage (user preferences - lower priority)
 * 3. Direct configuration
 */
let currentColorScheme: ColorScheme = { ...defaultColorScheme };

/**
 * Admin Color Scheme (from backend/admin panel)
 * This takes highest priority over user preferences
 */
let adminColorScheme: Partial<ColorScheme> | null = null;

/**
 * Get current color scheme with fallback mechanism
 *
 * Priority order:
 * 1. Database theme (from API - site-wide, affects all users)
 * 2. Cached theme (from localStorage - temporary cache)
 * 3. Default color scheme (fallback)
 */
export const getColorScheme = (): ColorScheme => {
  let scheme: ColorScheme = { ...defaultColorScheme };

  if (typeof window !== 'undefined') {
    // First, try to load from API cache (site-wide theme from database)
    const cachedTheme = localStorage.getItem('siteTheme');
    if (cachedTheme) {
      try {
        const parsedTheme = JSON.parse(cachedTheme);
        // Use cached theme if it's less than 5 minutes old
        const cacheTime = localStorage.getItem('siteThemeTime');
        if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          scheme = {
            ...defaultColorScheme,
            ...parsedTheme,
            // Ensure nested objects are properly merged
            header: parsedTheme.header
              ? { ...defaultColorScheme.header, ...parsedTheme.header }
              : defaultColorScheme.header,
            footer: parsedTheme.footer
              ? { ...defaultColorScheme.footer, ...parsedTheme.footer }
              : defaultColorScheme.footer,
            banner: parsedTheme.banner
              ? { ...defaultColorScheme.banner, ...parsedTheme.banner }
              : defaultColorScheme.banner,
            button: parsedTheme.button
              ? { ...defaultColorScheme.button, ...parsedTheme.button }
              : defaultColorScheme.button,
            card: parsedTheme.card
              ? { ...defaultColorScheme.card, ...parsedTheme.card }
              : defaultColorScheme.card,
            gray: parsedTheme.gray
              ? { ...defaultColorScheme.gray, ...parsedTheme.gray }
              : defaultColorScheme.gray,
          };
          currentColorScheme = scheme;
          return scheme;
        }
      } catch (e) {
        console.error('Failed to parse cached theme, fetching from API:', e);
      }
    }

    // If no valid cache, fetch from API asynchronously (non-blocking)
    // This ensures we return defaults immediately, then update when API responds
    fetchThemeFromAPI();
  }

  // Ensure all required properties exist (fallback safety)
  currentColorScheme = {
    ...defaultColorScheme,
    ...scheme,
    // Ensure nested objects are complete
    gray: { ...defaultColorScheme.gray, ...scheme.gray },
    header: { ...defaultColorScheme.header, ...scheme.header },
    footer: { ...defaultColorScheme.footer, ...scheme.footer },
    banner: { ...defaultColorScheme.banner, ...scheme.banner },
    button: { ...defaultColorScheme.button, ...scheme.button },
    card: { ...defaultColorScheme.card, ...scheme.card },
  };

  return currentColorScheme;
};

/**
 * Set admin color scheme (from admin panel/backend)
 * This takes highest priority and overrides user preferences
 */
export const setAdminColorScheme = (scheme: Partial<ColorScheme>): void => {
  // Merge with existing admin scheme (if any) or start fresh
  adminColorScheme = adminColorScheme
    ? { ...adminColorScheme, ...scheme }
    : { ...scheme };

  // Save to localStorage with admin prefix
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        'adminColorScheme',
        JSON.stringify(adminColorScheme)
      );

      // Update current scheme with proper nested object merging
      currentColorScheme = {
        ...defaultColorScheme,
        ...adminColorScheme,
        // Ensure nested objects are properly merged
        gray: adminColorScheme.gray
          ? { ...defaultColorScheme.gray, ...adminColorScheme.gray }
          : defaultColorScheme.gray,
        header: adminColorScheme.header
          ? { ...defaultColorScheme.header, ...adminColorScheme.header }
          : defaultColorScheme.header,
        footer: adminColorScheme.footer
          ? { ...defaultColorScheme.footer, ...adminColorScheme.footer }
          : defaultColorScheme.footer,
        banner: adminColorScheme.banner
          ? { ...defaultColorScheme.banner, ...adminColorScheme.banner }
          : defaultColorScheme.banner,
        button: adminColorScheme.button
          ? { ...defaultColorScheme.button, ...adminColorScheme.button }
          : defaultColorScheme.button,
        card: adminColorScheme.card
          ? { ...defaultColorScheme.card, ...adminColorScheme.card }
          : defaultColorScheme.card,
      };

      // Trigger theme update event with updated scheme
      window.dispatchEvent(
        new CustomEvent('theme-updated', { detail: currentColorScheme })
      );
    } catch (e) {
      console.error('Failed to save admin color scheme:', e);
    }
  }
};

/**
 * Set user color scheme (user preferences)
 * This is lower priority than admin scheme
 */
export const setUserColorScheme = (scheme: Partial<ColorScheme>): void => {
  // Don't override if admin scheme exists
  if (adminColorScheme) {
    console.warn(
      'Admin color scheme is active. User preferences will not override.'
    );
    return;
  }

  // Merge with current scheme
  currentColorScheme = { ...currentColorScheme, ...scheme };

  // Save to localStorage with user prefix
  if (typeof window !== 'undefined') {
    try {
      const userScheme = { ...defaultColorScheme, ...scheme };
      localStorage.setItem('userColorScheme', JSON.stringify(userScheme));

      // Trigger theme update event
      window.dispatchEvent(
        new CustomEvent('theme-updated', { detail: currentColorScheme })
      );
    } catch (e) {
      console.error('Failed to save user color scheme:', e);
    }
  }
};

/**
 * Set color scheme (backwards compatibility)
 * Uses user color scheme by default
 */
export const setColorScheme = (scheme: Partial<ColorScheme>): void => {
  setUserColorScheme(scheme);
};

/**
 * Reset admin color scheme to default (removes admin overrides)
 */
export const resetAdminColorScheme = (): void => {
  adminColorScheme = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminColorScheme');

    // Reload from user preferences or defaults
    currentColorScheme = getColorScheme();
    window.dispatchEvent(
      new CustomEvent('theme-updated', { detail: currentColorScheme })
    );
  }
};

/**
 * Reset user color scheme to default
 */
export const resetUserColorScheme = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userColorScheme');

    // Reload from admin preferences or defaults
    currentColorScheme = getColorScheme();
    window.dispatchEvent(
      new CustomEvent('theme-updated', { detail: currentColorScheme })
    );
  }
};

/**
 * Reset color scheme to default (backwards compatibility)
 * Resets user preferences and admin overrides
 */
export const resetColorScheme = (): void => {
  adminColorScheme = null;
  currentColorScheme = { ...defaultColorScheme };

  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminColorScheme');
    localStorage.removeItem('userColorScheme');
    window.dispatchEvent(
      new CustomEvent('theme-updated', { detail: currentColorScheme })
    );
  }
};

/**
 * Fetch theme from API and update cache
 * This is called asynchronously to load site-wide theme from database
 */
const fetchThemeFromAPI = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3010'}/theme/active`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.theme) {
        const themeFromDB = result.data.theme;

        // Convert database theme to ColorScheme format
        const dbColorScheme: Partial<ColorScheme> = {
          primary: themeFromDB.primary || defaultColorScheme.primary,
          primaryLight: themeFromDB.primaryLight || defaultColorScheme.primaryLight,
          primaryDark: themeFromDB.primaryDark || defaultColorScheme.primaryDark,
          primaryBg: themeFromDB.primaryBg || defaultColorScheme.primaryBg,
          secondary: themeFromDB.secondary || defaultColorScheme.secondary,
          secondaryLight: themeFromDB.secondaryLight || defaultColorScheme.secondaryLight,
          secondaryDark: themeFromDB.secondaryDark || defaultColorScheme.secondaryDark,
          success: themeFromDB.success || defaultColorScheme.success,
          warning: themeFromDB.warning || defaultColorScheme.warning,
          error: themeFromDB.error || defaultColorScheme.error,
          info: themeFromDB.info || defaultColorScheme.info,
          link: themeFromDB.link || defaultColorScheme.link,
          linkHover: themeFromDB.linkHover || defaultColorScheme.linkHover,
          text: themeFromDB.text || defaultColorScheme.text,
          textSecondary: themeFromDB.textSecondary || defaultColorScheme.textSecondary,
          textTertiary: themeFromDB.textTertiary || defaultColorScheme.textTertiary,
          textInverse: themeFromDB.textInverse || defaultColorScheme.textInverse,
          background: themeFromDB.background || defaultColorScheme.background,
          backgroundSecondary: themeFromDB.backgroundSecondary || defaultColorScheme.backgroundSecondary,
          backgroundTertiary: themeFromDB.backgroundTertiary || defaultColorScheme.backgroundTertiary,
          border: themeFromDB.border || defaultColorScheme.border,
          borderLight: themeFromDB.borderLight || defaultColorScheme.borderLight,
          borderDark: themeFromDB.borderDark || defaultColorScheme.borderDark,
          header: themeFromDB.header || defaultColorScheme.header,
          footer: themeFromDB.footer || defaultColorScheme.footer,
          banner: themeFromDB.banner || defaultColorScheme.banner,
          button: themeFromDB.button || defaultColorScheme.button,
          card: themeFromDB.card || defaultColorScheme.card,
          nav: themeFromDB.nav || defaultColorScheme.nav,
          logo: themeFromDB.logo || defaultColorScheme.logo,
          bodyText: themeFromDB.bodyText || defaultColorScheme.bodyText,
        };

        // Merge with defaults
        currentColorScheme = {
          ...defaultColorScheme,
          ...dbColorScheme,
          gray: defaultColorScheme.gray,
        };

        // Cache the theme
        localStorage.setItem('siteTheme', JSON.stringify(dbColorScheme));
        localStorage.setItem('siteThemeTime', Date.now().toString());

        // Trigger theme update event
        window.dispatchEvent(
          new CustomEvent('theme-updated', { detail: currentColorScheme })
        );
      }
    }
  } catch (error) {
    console.warn('Failed to fetch theme from API, using defaults:', error);
  }
};

// Initialize color scheme
getColorScheme();

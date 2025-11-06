import { useState, useEffect } from 'react';
import {
  getColorScheme,
  setColorScheme,
  setAdminColorScheme,
  setUserColorScheme,
  resetColorScheme,
  resetAdminColorScheme,
  resetUserColorScheme,
  ColorScheme,
  defaultColorScheme,
} from '@/configs/theme/colorScheme';
import { getTheme, ThemeConfig } from '@/assets/styles/antd/theme';

/**
 * React Hook for Theme Management
 * 
 * Provides access to the centralized color scheme and theme configuration.
 * Supports dynamic theme updates at runtime with fallback mechanism.
 * 
 * Priority order:
 * 1. Admin color scheme (from admin panel/backend)
 * 2. User preferences (from localStorage)
 * 3. Default color scheme (Apple-inspired fallback)
 */
export const useTheme = () => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getColorScheme());
  const [theme, setThemeState] = useState<ThemeConfig>(getTheme());

  // Listen for theme updates
  useEffect(() => {
    const handleThemeUpdate = (event: CustomEvent<ColorScheme>) => {
      setColorSchemeState(event.detail);
      setThemeState(getTheme());
    };

    window.addEventListener('theme-updated', handleThemeUpdate as EventListener);

    return () => {
      window.removeEventListener('theme-updated', handleThemeUpdate as EventListener);
    };
  }, []);

  /**
   * Update admin color scheme (highest priority)
   * Use this when updating theme from admin panel
   */
  const updateAdminColorScheme = (scheme: Partial<ColorScheme>) => {
    setAdminColorScheme(scheme);
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  /**
   * Update user color scheme (lower priority)
   * Use this for user preferences
   */
  const updateUserColorScheme = (scheme: Partial<ColorScheme>) => {
    setUserColorScheme(scheme);
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  /**
   * Update color scheme (backwards compatibility)
   * Uses user color scheme by default
   */
  const updateColorScheme = (scheme: Partial<ColorScheme>) => {
    setUserColorScheme(scheme);
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  /**
   * Reset admin color scheme to default
   */
  const resetAdmin = () => {
    resetAdminColorScheme();
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  /**
   * Reset user color scheme to default
   */
  const resetUser = () => {
    resetUserColorScheme();
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  /**
   * Reset color scheme to default (backwards compatibility)
   * Resets both admin and user preferences
   */
  const reset = () => {
    resetColorScheme();
    setColorSchemeState(getColorScheme());
    setThemeState(getTheme());
  };

  return {
    colorScheme,
    theme,
    defaultColorScheme, // Expose default for reference
    updateColorScheme, // Backwards compatible
    updateAdminColorScheme, // For admin panel
    updateUserColorScheme, // For user preferences
    reset, // Backwards compatible
    resetAdmin, // Reset admin overrides
    resetUser, // Reset user preferences
  };
};

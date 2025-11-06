/**
 * Theme Provider Component
 * 
 * Wraps the app with dynamic theme support
 * Updates ConfigProvider theme when color scheme changes
 */

import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider that provides dynamic theme updates
 * Listens for theme changes and updates ConfigProvider + CSS variables
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme: themeFromHook, colorScheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(themeFromHook);

  // Inject CSS variables for dynamic styling
  useEffect(() => {
    const injectCSSVariables = (scheme: typeof colorScheme) => {
      const root = document.documentElement;
      
      // Primary colors
      root.style.setProperty('--theme-primary', scheme.primary);
      root.style.setProperty('--theme-primary-light', scheme.primaryLight);
      root.style.setProperty('--theme-primary-dark', scheme.primaryDark);
      root.style.setProperty('--theme-primary-bg', scheme.primaryBg);
      
      // Secondary colors
      root.style.setProperty('--theme-secondary', scheme.secondary);
      root.style.setProperty('--theme-secondary-light', scheme.secondaryLight);
      root.style.setProperty('--theme-secondary-dark', scheme.secondaryDark);
      
      // Semantic colors
      root.style.setProperty('--theme-success', scheme.success);
      root.style.setProperty('--theme-warning', scheme.warning);
      root.style.setProperty('--theme-error', scheme.error);
      root.style.setProperty('--theme-info', scheme.info);
      
      // Link colors
      root.style.setProperty('--theme-link', scheme.link);
      root.style.setProperty('--theme-link-hover', scheme.linkHover);
      
      // Text colors
      root.style.setProperty('--theme-text', scheme.text);
      root.style.setProperty('--theme-text-secondary', scheme.textSecondary);
      root.style.setProperty('--theme-text-tertiary', scheme.textTertiary);
      root.style.setProperty('--theme-text-inverse', scheme.textInverse);
      
      // Background colors
      root.style.setProperty('--theme-background', scheme.background);
      root.style.setProperty('--theme-background-secondary', scheme.backgroundSecondary);
      root.style.setProperty('--theme-background-tertiary', scheme.backgroundTertiary);
      
      // Border colors
      root.style.setProperty('--theme-border', scheme.border);
      root.style.setProperty('--theme-border-light', scheme.borderLight);
      root.style.setProperty('--theme-border-dark', scheme.borderDark);
      
      // Header colors
      root.style.setProperty('--theme-header-background', scheme.header.background);
      root.style.setProperty('--theme-header-text', scheme.header.text);
      root.style.setProperty('--theme-header-border', scheme.header.border);
      
      // Footer colors
      root.style.setProperty('--theme-footer-background', scheme.footer.background);
      root.style.setProperty('--theme-footer-text', scheme.footer.text);
      root.style.setProperty('--theme-footer-text-secondary', scheme.footer.textSecondary);
      root.style.setProperty('--theme-footer-border', scheme.footer.border);
      
      // Banner colors
      root.style.setProperty('--theme-banner-background', scheme.banner.background);
      root.style.setProperty('--theme-banner-text', scheme.banner.text);
      root.style.setProperty('--theme-banner-offer', scheme.banner.offer);
      root.style.setProperty('--theme-banner-voucher', scheme.banner.voucher);
      root.style.setProperty('--theme-banner-featured', scheme.banner.featured);
      root.style.setProperty('--theme-banner-flash-sale', scheme.banner.flashSale);
      
      // Button colors
      root.style.setProperty('--theme-button-primary', scheme.button.primary);
      root.style.setProperty('--theme-button-primary-hover', scheme.button.primaryHover);
      root.style.setProperty('--theme-button-secondary', scheme.button.secondary);
      root.style.setProperty('--theme-button-danger', scheme.button.danger);
      
      // Card colors
      root.style.setProperty('--theme-card-background', scheme.card.background);
      root.style.setProperty('--theme-card-border', scheme.card.border);
      root.style.setProperty('--theme-card-shadow', scheme.card.shadow);
      root.style.setProperty('--theme-card-hover-shadow', scheme.card.hoverShadow);

      // Navigation colors
      root.style.setProperty('--theme-nav-item-color', scheme.nav.itemColor);
      root.style.setProperty('--theme-nav-item-hover-color', scheme.nav.itemHoverColor);
      root.style.setProperty('--theme-nav-item-active-color', scheme.nav.itemActiveColor);
      root.style.setProperty('--theme-nav-item-active-bg', scheme.nav.itemActiveBg);

      // Logo colors
      root.style.setProperty('--theme-logo-icon-color', scheme.logo.iconColor);
      root.style.setProperty('--theme-logo-text-color', scheme.logo.textColor);

      // Body text configuration
      root.style.setProperty('--theme-body-font-family', scheme.bodyText.fontFamily);
      root.style.setProperty('--theme-body-font-size', `${scheme.bodyText.fontSize}px`);
      root.style.setProperty('--theme-body-line-height', scheme.bodyText.lineHeight.toString());
      root.style.setProperty('--theme-body-color', scheme.bodyText.color);

      // Neutral colors
      root.style.setProperty('--theme-white', scheme.white);
      root.style.setProperty('--theme-black', scheme.black);
      root.style.setProperty('--theme-dark', scheme.dark);

      // Gray scale
      root.style.setProperty('--theme-gray-50', scheme.gray[50]);
      root.style.setProperty('--theme-gray-100', scheme.gray[100]);
      root.style.setProperty('--theme-gray-200', scheme.gray[200]);
      root.style.setProperty('--theme-gray-300', scheme.gray[300]);
      root.style.setProperty('--theme-gray-400', scheme.gray[400]);
      root.style.setProperty('--theme-gray-500', scheme.gray[500]);
      root.style.setProperty('--theme-gray-600', scheme.gray[600]);
      root.style.setProperty('--theme-gray-700', scheme.gray[700]);
      root.style.setProperty('--theme-gray-800', scheme.gray[800]);
      root.style.setProperty('--theme-gray-900', scheme.gray[900]);

      // Accent colors
      root.style.setProperty('--theme-accent', scheme.accent);
      root.style.setProperty('--theme-accent-hover', scheme.accentHover);

      // Additional semantic colors
      root.style.setProperty('--theme-banner-coming-soon', scheme.banner.comingSoon);
      root.style.setProperty('--theme-button-secondary-hover', scheme.button.secondaryHover);
      root.style.setProperty('--theme-button-danger-hover', scheme.button.dangerHover);
    };

    // Inject CSS variables on initial load
    injectCSSVariables(colorScheme);

    // Listen for theme updates from color scheme changes
    const handleThemeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<typeof colorScheme>;
      const updatedScheme = customEvent.detail || colorScheme;
      
      // Inject updated CSS variables
      injectCSSVariables(updatedScheme);
      
      // Get updated theme when color scheme changes
      import('@/assets/styles/antd/theme').then(({ getTheme }) => {
        const updatedTheme = getTheme();
        setCurrentTheme(updatedTheme);
      });
    };

    window.addEventListener('theme-updated', handleThemeUpdate);

    return () => {
      window.removeEventListener('theme-updated', handleThemeUpdate);
    };
  }, [colorScheme]);

  // Update theme when hook changes (fallback)
  useEffect(() => {
    if (themeFromHook) {
      setCurrentTheme(themeFromHook);
    }
  }, [themeFromHook]);

  return (
    <ConfigProvider theme={currentTheme}>
      {children}
    </ConfigProvider>
  );
};

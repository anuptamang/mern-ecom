/**
 * Theme Provider Component
 * 
 * Wraps the app with dynamic theme support
 * Updates ConfigProvider theme when color scheme changes
 */

import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from 'hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider that provides dynamic theme updates
 * Listens for theme changes and updates ConfigProvider
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Listen for theme updates
  useEffect(() => {
    const handleThemeUpdate = () => {
      // Get updated theme when color scheme changes
      import('assets/styles/antd/theme').then(({ getTheme }) => {
        setCurrentTheme(getTheme());
      });
    };

    window.addEventListener('theme-updated', handleThemeUpdate as EventListener);

    return () => {
      window.removeEventListener('theme-updated', handleThemeUpdate as EventListener);
    };
  }, []);

  // Update theme when it changes
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <ConfigProvider theme={currentTheme}>
      {children}
    </ConfigProvider>
  );
};

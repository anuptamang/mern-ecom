import { ThemeConfig } from "antd";
import { getColorScheme } from "configs/theme/colorScheme";

/**
 * Ant Design Theme Configuration
 * 
 * This theme is automatically generated from the centralized color scheme.
 * To update colors, modify colorScheme.ts instead of this file.
 */
const colorScheme = getColorScheme();

// Re-export ThemeConfig for use in other files
export type { ThemeConfig };

export const theme: ThemeConfig = {
  token: {
    // Primary colors from centralized scheme
    colorPrimary: colorScheme.primary,
    colorPrimaryBg: colorScheme.primaryBg,
    colorPrimaryHover: colorScheme.primaryLight,
    
    // Link colors
    colorLink: colorScheme.link,
    colorLinkHover: colorScheme.linkHover,
    
    // Text colors
    colorText: colorScheme.text,
    colorTextSecondary: colorScheme.textSecondary,
    colorTextTertiary: colorScheme.textTertiary,
    
    // Success, Warning, Error, Info
    colorSuccess: colorScheme.success,
    colorWarning: colorScheme.warning,
    colorError: colorScheme.error,
    colorInfo: colorScheme.info,
    
    // Border colors
    colorBorder: colorScheme.border,
    colorBorderSecondary: colorScheme.borderLight,
    
    // Background colors
    colorBgContainer: colorScheme.background,
    colorBgElevated: colorScheme.backgroundSecondary,
    colorBgLayout: colorScheme.backgroundTertiary,
    
    // Typography
    fontSize: 16,
    fontFamily: "Mulish, sans-serif",
  },

  components: {
    Button: {
      colorPrimary: colorScheme.button.primary,
      colorPrimaryHover: colorScheme.button.primaryHover,
      // Note: Button text color is controlled by colorText in token
    },
    Card: {
      colorBgContainer: colorScheme.card.background,
      colorBorderSecondary: colorScheme.card.border,
      boxShadowTertiary: `0 2px 8px ${colorScheme.card.shadow}`,
      boxShadowSecondary: `0 4px 12px ${colorScheme.card.hoverShadow}`,
    },
    Input: {
      colorBorder: colorScheme.border,
      colorPrimary: colorScheme.primary,
      // Note: Input border hover is controlled by colorBorder in token
    },
    Menu: {
      colorItemBg: colorScheme.background,
      colorItemText: colorScheme.text,
      colorItemTextHover: colorScheme.primary,
      colorItemTextSelected: colorScheme.textInverse,
      colorItemBgSelected: colorScheme.primary,
    },
  },
};

/**
 * Get updated theme (call this when color scheme changes)
 */
export const getTheme = (): ThemeConfig => {
  const updatedColorScheme = getColorScheme();
  
  return {
    ...theme,
    token: {
      ...theme.token,
      colorPrimary: updatedColorScheme.primary,
      colorPrimaryBg: updatedColorScheme.primaryBg,
      colorLink: updatedColorScheme.link,
      colorText: updatedColorScheme.text,
      colorSuccess: updatedColorScheme.success,
      colorWarning: updatedColorScheme.warning,
      colorError: updatedColorScheme.error,
      colorInfo: updatedColorScheme.info,
    },
    components: {
      ...theme.components,
      Button: {
        colorPrimary: updatedColorScheme.button.primary,
        colorPrimaryHover: updatedColorScheme.button.primaryHover,
      },
    },
  };
};

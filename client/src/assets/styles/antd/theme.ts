import { ThemeConfig } from "antd";
import { getColorScheme } from "@/configs/theme/colorScheme";

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
    colorPrimaryActive: colorScheme.primaryDark,
    
    // Link colors
    colorLink: colorScheme.link,
    colorLinkHover: colorScheme.linkHover,
    colorLinkActive: colorScheme.primaryDark,
    
    // Text colors
    colorText: colorScheme.text,
    colorTextSecondary: colorScheme.textSecondary,
    colorTextTertiary: colorScheme.textTertiary,
    colorTextQuaternary: colorScheme.textTertiary,
    colorTextHeading: colorScheme.text,
    
    // Success, Warning, Error, Info
    colorSuccess: colorScheme.success,
    colorSuccessBg: `${colorScheme.success}15`, // 15 = ~8% opacity
    colorSuccessHover: colorScheme.success,
    colorSuccessActive: colorScheme.success,
    colorWarning: colorScheme.warning,
    colorWarningBg: `${colorScheme.warning}15`,
    colorWarningHover: colorScheme.warning,
    colorWarningActive: colorScheme.warning,
    colorError: colorScheme.error,
    colorErrorBg: `${colorScheme.error}15`,
    colorErrorHover: colorScheme.error,
    colorErrorActive: colorScheme.error,
    colorInfo: colorScheme.info,
    colorInfoBg: `${colorScheme.info}15`,
    colorInfoHover: colorScheme.info,
    colorInfoActive: colorScheme.info,
    
    // Border colors
    colorBorder: colorScheme.border,
    colorBorderSecondary: colorScheme.borderLight,
    colorBorderBg: colorScheme.background,
    
    // Background colors
    colorBgContainer: colorScheme.background,
    colorBgElevated: colorScheme.backgroundSecondary,
    colorBgLayout: colorScheme.backgroundTertiary,
    colorBgSpotlight: colorScheme.backgroundSecondary,
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
    
    // Typography - Use bodyText from colorScheme
    fontSize: colorScheme.bodyText?.fontSize || 16,
    fontFamily: colorScheme.bodyText?.fontFamily || "Mulish, sans-serif",
    lineHeight: colorScheme.bodyText?.lineHeight || 1.5,
    
    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // Box shadow
    boxShadow: `0 2px 8px ${colorScheme.card.shadow}`,
    boxShadowSecondary: `0 4px 12px ${colorScheme.card.hoverShadow}`,
  },

  components: {
    Button: {
      colorPrimary: colorScheme.button.primary,
      colorPrimaryHover: colorScheme.button.primaryHover,
      colorPrimaryActive: colorScheme.primaryDark,
      colorText: colorScheme.textInverse,
      colorTextDisabled: colorScheme.textTertiary,
    },
    Card: {
      colorBgContainer: colorScheme.card.background,
      colorBorderSecondary: colorScheme.card.border,
      boxShadowTertiary: `0 2px 8px ${colorScheme.card.shadow}`,
      boxShadowSecondary: `0 4px 12px ${colorScheme.card.hoverShadow}`,
      colorTextHeading: colorScheme.text,
      colorText: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
    },
    Input: {
      colorBorder: colorScheme.border,
      colorPrimary: colorScheme.primary,
      colorPrimaryHover: colorScheme.primaryLight,
      colorBgContainer: colorScheme.background,
      colorText: colorScheme.text,
      colorTextPlaceholder: colorScheme.textTertiary,
    },
    Menu: {
      colorItemBg: colorScheme.background,
      colorItemText: colorScheme.text,
      colorItemTextHover: colorScheme.primary,
      colorItemTextSelected: colorScheme.textInverse,
      colorItemBgSelected: colorScheme.primary,
    },
    Tag: {
      colorSuccess: colorScheme.success,
      colorWarning: colorScheme.warning,
      colorError: colorScheme.error,
      colorInfo: colorScheme.info,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorBgContainer: colorScheme.backgroundSecondary,
    },
    Badge: {
      colorError: colorScheme.error,
      colorInfo: colorScheme.info,
      colorSuccess: colorScheme.success,
      colorWarning: colorScheme.warning,
      colorText: colorScheme.textInverse,
      colorTextHeading: colorScheme.textInverse,
    },
    Avatar: {
      colorBgContainer: colorScheme.primary,
      colorText: colorScheme.textInverse,
      colorTextHeading: colorScheme.textInverse,
      colorTextDescription: colorScheme.textInverse,
    },
    List: {
      colorBgContainer: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
      colorSplit: colorScheme.borderLight,
    },
    Table: {
      colorBgContainer: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorBorderSecondary: colorScheme.borderLight,
      colorFillAlter: colorScheme.backgroundSecondary,
      colorFillSecondary: colorScheme.backgroundTertiary,
      colorFillContent: colorScheme.backgroundSecondary,
      colorFillContentHover: colorScheme.backgroundTertiary,
    },
    Modal: {
      colorBgElevated: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorIcon: colorScheme.text,
      colorIconHover: colorScheme.primary,
    },
    Tabs: {
      colorBgContainer: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorPrimary: colorScheme.primary,
      colorBorderSecondary: colorScheme.borderLight,
    },
    Alert: {
      colorInfo: colorScheme.info,
      colorSuccess: colorScheme.success,
      colorWarning: colorScheme.warning,
      colorError: colorScheme.error,
      colorInfoBg: `${colorScheme.info}15`,
      colorSuccessBg: `${colorScheme.success}15`,
      colorWarningBg: `${colorScheme.warning}15`,
      colorErrorBg: `${colorScheme.error}15`,
      colorInfoBorder: colorScheme.info,
      colorSuccessBorder: colorScheme.success,
      colorWarningBorder: colorScheme.warning,
      colorErrorBorder: colorScheme.error,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
    },
    Progress: {
      colorSuccess: colorScheme.success,
      colorInfo: colorScheme.info,
      colorWarning: colorScheme.warning,
      colorError: colorScheme.error,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
    },
    Form: {
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
      colorError: colorScheme.error,
      colorWarning: colorScheme.warning,
      colorSuccess: colorScheme.success,
      colorInfo: colorScheme.info,
    },
    Select: {
      colorBgContainer: colorScheme.background,
      colorBorder: colorScheme.border,
      colorPrimary: colorScheme.primary,
      colorPrimaryHover: colorScheme.primaryLight,
      colorText: colorScheme.text,
      colorTextPlaceholder: colorScheme.textTertiary,
      colorTextQuaternary: colorScheme.textTertiary,
    },
    Typography: {
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
      colorTextSecondary: colorScheme.textSecondary,
      colorTextTertiary: colorScheme.textTertiary,
      colorLink: colorScheme.link,
      colorLinkHover: colorScheme.linkHover,
      colorLinkActive: colorScheme.primaryDark,
    },
    Divider: {
      colorSplit: colorScheme.borderLight,
      colorText: colorScheme.textSecondary,
    },
    Upload: {
      colorBgContainer: colorScheme.background,
      colorBorder: colorScheme.border,
      colorPrimary: colorScheme.primary,
      colorText: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
    },
    Checkbox: {
      colorPrimary: colorScheme.primary,
      colorPrimaryHover: colorScheme.primaryLight,
      colorBgContainer: colorScheme.background,
      colorBorder: colorScheme.border,
      colorText: colorScheme.text,
    },
    Radio: {
      colorPrimary: colorScheme.primary,
      colorPrimaryHover: colorScheme.primaryLight,
      colorBgContainer: colorScheme.background,
      colorBorder: colorScheme.border,
      colorText: colorScheme.text,
    },
    Spin: {
      colorPrimary: colorScheme.primary,
      colorText: colorScheme.text,
    },
    Empty: {
      colorText: colorScheme.textSecondary,
      colorTextDescription: colorScheme.textTertiary,
    },
    Dropdown: {
      colorBgElevated: colorScheme.background,
      colorText: colorScheme.text,
      colorTextSecondary: colorScheme.textSecondary,
      colorPrimary: colorScheme.primary,
      colorPrimaryHover: colorScheme.primaryLight,
    },
    Popconfirm: {
      colorBgElevated: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorTextDescription: colorScheme.textSecondary,
      colorPrimary: colorScheme.primary,
      colorError: colorScheme.error,
    },
    Tooltip: {
      colorBgSpotlight: colorScheme.dark,
      colorTextLightSolid: colorScheme.textInverse,
    },
    Message: {
      colorBgElevated: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorSuccess: colorScheme.success,
      colorWarning: colorScheme.warning,
      colorError: colorScheme.error,
      colorInfo: colorScheme.info,
    },
    Notification: {
      colorBgElevated: colorScheme.background,
      colorText: colorScheme.text,
      colorTextHeading: colorScheme.text,
      colorSuccess: colorScheme.success,
      colorWarning: colorScheme.warning,
      colorError: colorScheme.error,
      colorInfo: colorScheme.info,
    },
    Image: {
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      colorTextLightSolid: colorScheme.textInverse,
    },
  },
};

/**
 * Get updated theme (call this when color scheme changes)
 * This function recalculates the theme from the current color scheme
 */
export const getTheme = (): ThemeConfig => {
  const updatedColorScheme = getColorScheme();
  
  // Reuse the same theme structure but with updated color scheme
  return {
    token: {
      // Primary colors from centralized scheme
      colorPrimary: updatedColorScheme.primary,
      colorPrimaryBg: updatedColorScheme.primaryBg,
      colorPrimaryHover: updatedColorScheme.primaryLight,
      colorPrimaryActive: updatedColorScheme.primaryDark,
      
      // Link colors
      colorLink: updatedColorScheme.link,
      colorLinkHover: updatedColorScheme.linkHover,
      colorLinkActive: updatedColorScheme.primaryDark,
      
      // Text colors
      colorText: updatedColorScheme.text,
      colorTextSecondary: updatedColorScheme.textSecondary,
      colorTextTertiary: updatedColorScheme.textTertiary,
      colorTextQuaternary: updatedColorScheme.textTertiary,
      colorTextHeading: updatedColorScheme.text,
      
      // Success, Warning, Error, Info
      colorSuccess: updatedColorScheme.success,
      colorSuccessBg: `${updatedColorScheme.success}15`,
      colorSuccessHover: updatedColorScheme.success,
      colorSuccessActive: updatedColorScheme.success,
      colorWarning: updatedColorScheme.warning,
      colorWarningBg: `${updatedColorScheme.warning}15`,
      colorWarningHover: updatedColorScheme.warning,
      colorWarningActive: updatedColorScheme.warning,
      colorError: updatedColorScheme.error,
      colorErrorBg: `${updatedColorScheme.error}15`,
      colorErrorHover: updatedColorScheme.error,
      colorErrorActive: updatedColorScheme.error,
      colorInfo: updatedColorScheme.info,
      colorInfoBg: `${updatedColorScheme.info}15`,
      colorInfoHover: updatedColorScheme.info,
      colorInfoActive: updatedColorScheme.info,
      
      // Border colors
      colorBorder: updatedColorScheme.border,
      colorBorderSecondary: updatedColorScheme.borderLight,
      colorBorderBg: updatedColorScheme.background,
      
      // Background colors
      colorBgContainer: updatedColorScheme.background,
      colorBgElevated: updatedColorScheme.backgroundSecondary,
      colorBgLayout: updatedColorScheme.backgroundTertiary,
      colorBgSpotlight: updatedColorScheme.backgroundSecondary,
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      
      // Typography - Use bodyText from colorScheme
      fontSize: updatedColorScheme.bodyText?.fontSize || 16,
      fontFamily: updatedColorScheme.bodyText?.fontFamily || "Mulish, sans-serif",
      lineHeight: updatedColorScheme.bodyText?.lineHeight || 1.5,
      
      // Border radius
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      
      // Box shadow
      boxShadow: `0 2px 8px ${updatedColorScheme.card.shadow}`,
      boxShadowSecondary: `0 4px 12px ${updatedColorScheme.card.hoverShadow}`,
    },

    components: {
      Button: {
        colorPrimary: updatedColorScheme.button.primary,
        colorPrimaryHover: updatedColorScheme.button.primaryHover,
        colorPrimaryActive: updatedColorScheme.primaryDark,
        colorText: updatedColorScheme.textInverse,
        colorTextDisabled: updatedColorScheme.textTertiary,
      },
      Card: {
        colorBgContainer: updatedColorScheme.card.background,
        colorBorderSecondary: updatedColorScheme.card.border,
        boxShadowTertiary: `0 2px 8px ${updatedColorScheme.card.shadow}`,
        boxShadowSecondary: `0 4px 12px ${updatedColorScheme.card.hoverShadow}`,
        colorTextHeading: updatedColorScheme.text,
        colorText: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
      },
      Input: {
        colorBorder: updatedColorScheme.border,
        colorPrimary: updatedColorScheme.primary,
        colorPrimaryHover: updatedColorScheme.primaryLight,
        colorBgContainer: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextPlaceholder: updatedColorScheme.textTertiary,
      },
      Menu: {
        colorItemBg: updatedColorScheme.background,
        colorItemText: updatedColorScheme.text,
        colorItemTextHover: updatedColorScheme.primary,
        colorItemTextSelected: updatedColorScheme.textInverse,
        colorItemBgSelected: updatedColorScheme.primary,
      },
      Tag: {
        colorSuccess: updatedColorScheme.success,
        colorWarning: updatedColorScheme.warning,
        colorError: updatedColorScheme.error,
        colorInfo: updatedColorScheme.info,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorBgContainer: updatedColorScheme.backgroundSecondary,
      },
      Badge: {
        colorError: updatedColorScheme.error,
        colorInfo: updatedColorScheme.info,
        colorSuccess: updatedColorScheme.success,
        colorWarning: updatedColorScheme.warning,
        colorText: updatedColorScheme.textInverse,
        colorTextHeading: updatedColorScheme.textInverse,
      },
      Avatar: {
        colorBgContainer: updatedColorScheme.primary,
        colorText: updatedColorScheme.textInverse,
        colorTextHeading: updatedColorScheme.textInverse,
        colorTextDescription: updatedColorScheme.textInverse,
      },
      List: {
        colorBgContainer: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
        colorSplit: updatedColorScheme.borderLight,
      },
      Table: {
        colorBgContainer: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorBorderSecondary: updatedColorScheme.borderLight,
        colorFillAlter: updatedColorScheme.backgroundSecondary,
        colorFillSecondary: updatedColorScheme.backgroundTertiary,
        colorFillContent: updatedColorScheme.backgroundSecondary,
        colorFillContentHover: updatedColorScheme.backgroundTertiary,
      },
      Modal: {
        colorBgElevated: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorIcon: updatedColorScheme.text,
        colorIconHover: updatedColorScheme.primary,
      },
      Tabs: {
        colorBgContainer: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorPrimary: updatedColorScheme.primary,
        colorBorderSecondary: updatedColorScheme.borderLight,
      },
      Alert: {
        colorInfo: updatedColorScheme.info,
        colorSuccess: updatedColorScheme.success,
        colorWarning: updatedColorScheme.warning,
        colorError: updatedColorScheme.error,
        colorInfoBg: `${updatedColorScheme.info}15`,
        colorSuccessBg: `${updatedColorScheme.success}15`,
        colorWarningBg: `${updatedColorScheme.warning}15`,
        colorErrorBg: `${updatedColorScheme.error}15`,
        colorInfoBorder: updatedColorScheme.info,
        colorSuccessBorder: updatedColorScheme.success,
        colorWarningBorder: updatedColorScheme.warning,
        colorErrorBorder: updatedColorScheme.error,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
      },
      Progress: {
        colorSuccess: updatedColorScheme.success,
        colorInfo: updatedColorScheme.info,
        colorWarning: updatedColorScheme.warning,
        colorError: updatedColorScheme.error,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
      },
      Form: {
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
        colorError: updatedColorScheme.error,
        colorWarning: updatedColorScheme.warning,
        colorSuccess: updatedColorScheme.success,
        colorInfo: updatedColorScheme.info,
      },
      Select: {
        colorBgContainer: updatedColorScheme.background,
        colorBorder: updatedColorScheme.border,
        colorPrimary: updatedColorScheme.primary,
        colorPrimaryHover: updatedColorScheme.primaryLight,
        colorText: updatedColorScheme.text,
        colorTextPlaceholder: updatedColorScheme.textTertiary,
        colorTextQuaternary: updatedColorScheme.textTertiary,
      },
      Typography: {
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
        colorTextSecondary: updatedColorScheme.textSecondary,
        colorTextTertiary: updatedColorScheme.textTertiary,
        colorLink: updatedColorScheme.link,
        colorLinkHover: updatedColorScheme.linkHover,
        colorLinkActive: updatedColorScheme.primaryDark,
      },
      Divider: {
        colorSplit: updatedColorScheme.borderLight,
        colorText: updatedColorScheme.textSecondary,
      },
      Upload: {
        colorBgContainer: updatedColorScheme.background,
        colorBorder: updatedColorScheme.border,
        colorPrimary: updatedColorScheme.primary,
        colorText: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
      },
      Checkbox: {
        colorPrimary: updatedColorScheme.primary,
        colorPrimaryHover: updatedColorScheme.primaryLight,
        colorBgContainer: updatedColorScheme.background,
        colorBorder: updatedColorScheme.border,
        colorText: updatedColorScheme.text,
      },
      Radio: {
        colorPrimary: updatedColorScheme.primary,
        colorPrimaryHover: updatedColorScheme.primaryLight,
        colorBgContainer: updatedColorScheme.background,
        colorBorder: updatedColorScheme.border,
        colorText: updatedColorScheme.text,
      },
      Spin: {
        colorPrimary: updatedColorScheme.primary,
        colorText: updatedColorScheme.text,
      },
      Empty: {
        colorText: updatedColorScheme.textSecondary,
        colorTextDescription: updatedColorScheme.textTertiary,
      },
      Dropdown: {
        colorBgElevated: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextSecondary: updatedColorScheme.textSecondary,
        colorPrimary: updatedColorScheme.primary,
        colorPrimaryHover: updatedColorScheme.primaryLight,
      },
      Popconfirm: {
        colorBgElevated: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorTextDescription: updatedColorScheme.textSecondary,
        colorPrimary: updatedColorScheme.primary,
        colorError: updatedColorScheme.error,
      },
      Tooltip: {
        colorBgSpotlight: updatedColorScheme.dark,
        colorTextLightSolid: updatedColorScheme.textInverse,
      },
      Message: {
        colorBgElevated: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorSuccess: updatedColorScheme.success,
        colorWarning: updatedColorScheme.warning,
        colorError: updatedColorScheme.error,
        colorInfo: updatedColorScheme.info,
      },
      Notification: {
        colorBgElevated: updatedColorScheme.background,
        colorText: updatedColorScheme.text,
        colorTextHeading: updatedColorScheme.text,
        colorSuccess: updatedColorScheme.success,
        colorWarning: updatedColorScheme.warning,
        colorError: updatedColorScheme.error,
        colorInfo: updatedColorScheme.info,
      },
      Image: {
        colorBgMask: 'rgba(0, 0, 0, 0.45)',
        colorTextLightSolid: updatedColorScheme.textInverse,
      },
    },
  };
};

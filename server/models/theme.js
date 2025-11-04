/**
 * Theme Model
 * Stores site-wide theme configuration in database
 * This allows admin to control the appearance for all users
 */

import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    // Theme identifier (only one active theme)
    isActive: {
      type: Boolean,
      default: true,
    },

    // Primary Colors
    primary: {
      type: String,
      default: '#0071e3', // Apple blue
    },
    primaryLight: {
      type: String,
      default: '#007aff',
    },
    primaryDark: {
      type: String,
      default: '#0066cc',
    },
    primaryBg: {
      type: String,
      default: '#f0f8ff',
    },

    // Secondary Colors
    secondary: {
      type: String,
      default: '#6e6e73',
    },
    secondaryLight: {
      type: String,
      default: '#86868b',
    },
    secondaryDark: {
      type: String,
      default: '#424245',
    },

    // Semantic Colors
    success: {
      type: String,
      default: '#34c759', // Apple green
    },
    warning: {
      type: String,
      default: '#ff9500', // Apple orange
    },
    error: {
      type: String,
      default: '#ff3b30', // Apple red
    },
    info: {
      type: String,
      default: '#0071e3', // Apple blue
    },

    // Link Colors
    link: {
      type: String,
      default: '#0071e3',
    },
    linkHover: {
      type: String,
      default: '#007aff',
    },

    // Text Colors
    text: {
      type: String,
      default: '#1d1d1f',
    },
    textSecondary: {
      type: String,
      default: '#6e6e73',
    },
    textTertiary: {
      type: String,
      default: '#86868b',
    },
    textInverse: {
      type: String,
      default: '#ffffff',
    },

    // Background Colors
    background: {
      type: String,
      default: '#ffffff',
    },
    backgroundSecondary: {
      type: String,
      default: '#fafafa',
    },
    backgroundTertiary: {
      type: String,
      default: '#f5f5f5',
    },

    // Border Colors
    border: {
      type: String,
      default: '#d1d1d1',
    },
    borderLight: {
      type: String,
      default: '#e5e5e5',
    },
    borderDark: {
      type: String,
      default: '#86868b',
    },

    // Header Colors
    header: {
      background: {
        type: String,
        default: '#ffffff',
      },
      text: {
        type: String,
        default: '#1d1d1f',
      },
      border: {
        type: String,
        default: 'rgba(0, 0, 0, 0.08)',
      },
    },

    // Footer Colors
    footer: {
      background: {
        type: String,
        default: '#f5f5f5',
      },
      text: {
        type: String,
        default: '#6e6e73',
      },
      textSecondary: {
        type: String,
        default: 'rgba(110, 110, 115, 0.7)',
      },
      border: {
        type: String,
        default: 'rgba(0, 0, 0, 0.08)',
      },
    },

    // Banner Colors
    banner: {
      background: {
        type: String,
        default: '#0071e3',
      },
      text: {
        type: String,
        default: '#ffffff',
      },
      offer: {
        type: String,
        default: '#ff3b30',
      },
      voucher: {
        type: String,
        default: '#34c759',
      },
      featured: {
        type: String,
        default: '#0071e3',
      },
      comingSoon: {
        type: String,
        default: '#ff9500',
      },
      flashSale: {
        type: String,
        default: '#ff3b30',
      },
    },

    // Button Colors
    button: {
      primary: {
        type: String,
        default: '#0071e3',
      },
      primaryHover: {
        type: String,
        default: '#007aff',
      },
      secondary: {
        type: String,
        default: '#6e6e73',
      },
      secondaryHover: {
        type: String,
        default: '#86868b',
      },
      danger: {
        type: String,
        default: '#ff3b30',
      },
      dangerHover: {
        type: String,
        default: '#ff453a',
      },
    },

    // Card Colors
    card: {
      background: {
        type: String,
        default: '#ffffff',
      },
      border: {
        type: String,
        default: '#e5e5e5',
      },
      shadow: {
        type: String,
        default: 'rgba(0, 0, 0, 0.08)',
      },
      hoverShadow: {
        type: String,
        default: 'rgba(0, 0, 0, 0.12)',
      },
    },

    // Navigation/Menu Colors
    nav: {
      itemColor: {
        type: String,
        default: '#1d1d1f',
      },
      itemHoverColor: {
        type: String,
        default: '#0071e3',
      },
      itemActiveColor: {
        type: String,
        default: '#0071e3',
      },
      itemActiveBg: {
        type: String,
        default: 'transparent',
      },
    },

    // Logo Configuration
    logo: {
      imageUrl: {
        type: String,
        default: null, // No custom logo by default
      },
      text: {
        type: String,
        default: null, // Use site title by default
      },
      iconColor: {
        type: String,
        default: '#0071e3',
      },
      textColor: {
        type: String,
        default: '#1d1d1f',
      },
    },

    // Body Text Configuration
    bodyText: {
      fontFamily: {
        type: String,
        default: 'Mulish, sans-serif',
      },
      fontSize: {
        type: Number,
        default: 16,
      },
      lineHeight: {
        type: Number,
        default: 1.5,
      },
      color: {
        type: String,
        default: '#1d1d1f',
      },
    },

    // Metadata
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active theme
themeSchema.index({ isActive: 1 }, { unique: true, sparse: true });

// Find or create single theme document
themeSchema.statics.getOrCreateTheme = async function () {
  let theme = await this.findOne({ isActive: true });
  if (!theme) {
    // Create default theme if none exists
    theme = await this.create({ isActive: true });
  }
  return theme;
};

// Get active theme (public endpoint - no auth required)
themeSchema.statics.getActiveTheme = async function () {
  const theme = await this.findOne({ isActive: true });
  if (!theme) {
    // Return default values if no theme exists
    return this.findOne({ isActive: true }) || {};
  }
  return theme;
};

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;

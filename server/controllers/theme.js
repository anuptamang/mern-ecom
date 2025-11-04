/**
 * Theme Controller
 * Handles theme management for site-wide appearance
 */

import Theme from '../models/theme.js';
import { createError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import path from 'path';

/**
 * Get active theme (public - all users can access)
 * Used by frontend to apply site-wide theme
 */
export const getActiveTheme = async (req, res, next) => {
  try {
    const theme = await Theme.getActiveTheme();
    
    if (!theme) {
      // Return default theme structure if no theme exists
      const defaultTheme = await Theme.getOrCreateTheme();
      return res.status(200).json({
        success: true,
        data: {
          theme: defaultTheme,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        theme: theme.toObject(),
      },
    });
  } catch (error) {
    logger.error('Error getting active theme', {
      error: error.message,
      stack: error.stack,
    });
    next(createError('Failed to get theme', 500));
  }
};

/**
 * Update theme (admin only)
 * Updates site-wide theme that affects all users
 */
export const updateTheme = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    const updateData = req.body;

    // Get or create active theme
    let theme = await Theme.findOne({ isActive: true });

    if (!theme) {
      // Create new theme if none exists
      theme = new Theme({
        isActive: true,
        updatedBy: userId,
        ...updateData,
      });
    } else {
      // First update nested objects
      // Handle nested objects properly - need to mark as modified for Mongoose
      if (updateData.header) {
        theme.header = { ...theme.header, ...updateData.header };
        theme.markModified('header');
      }
      if (updateData.footer) {
        theme.footer = { ...theme.footer, ...updateData.footer };
        theme.markModified('footer');
      }
      if (updateData.banner) {
        theme.banner = { ...theme.banner, ...updateData.banner };
        theme.markModified('banner');
      }
      if (updateData.button) {
        theme.button = { ...theme.button, ...updateData.button };
        theme.markModified('button');
      }
      if (updateData.card) {
        theme.card = { ...theme.card, ...updateData.card };
        theme.markModified('card');
      }
      if (updateData.nav) {
        theme.nav = { ...theme.nav, ...updateData.nav };
        theme.markModified('nav');
      }
      if (updateData.logo) {
        theme.logo = { ...theme.logo, ...updateData.logo };
        theme.markModified('logo');
      }
      if (updateData.bodyText) {
        theme.bodyText = { ...theme.bodyText, ...updateData.bodyText };
        theme.markModified('bodyText');
      }

      // Update top-level properties (primary, secondary, success, warning, error, info, link, etc.)
      const topLevelProps = [
        'primary', 'primaryLight', 'primaryDark', 'primaryBg',
        'secondary', 'secondaryLight', 'secondaryDark',
        'success', 'warning', 'error', 'info',
        'link', 'linkHover',
        'text', 'textSecondary', 'textTertiary', 'textInverse',
        'background', 'backgroundSecondary', 'backgroundTertiary',
        'border', 'borderLight', 'borderDark'
      ];
      
      topLevelProps.forEach((prop) => {
        if (updateData[prop] !== undefined) {
          theme[prop] = updateData[prop];
        }
      });

      theme.updatedBy = userId;
      theme.version = (theme.version || 0) + 1;
    }

    await theme.save();

    logger.info('Theme updated successfully', {
      userId,
      themeId: theme._id,
      version: theme.version,
    });

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: {
        theme: theme.toObject(),
      },
    });
  } catch (error) {
    logger.error('Error updating theme', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    next(createError('Failed to update theme', 500));
  }
};

/**
 * Reset theme to defaults (admin only)
 */
export const resetTheme = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    // Delete current theme
    await Theme.deleteOne({ isActive: true });

    // Create new default theme
    const defaultTheme = new Theme({
      isActive: true,
      updatedBy: userId,
    });
    await defaultTheme.save();

    logger.info('Theme reset to defaults', {
      userId,
      themeId: defaultTheme._id,
    });

    res.status(200).json({
      success: true,
      message: 'Theme reset to default values',
      data: {
        theme: defaultTheme.toObject(),
      },
    });
  } catch (error) {
    logger.error('Error resetting theme', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    next(createError('Failed to reset theme', 500));
  }
};

/**
 * Get theme history (admin only)
 */
export const getThemeHistory = async (req, res, next) => {
  try {
    const themes = await Theme.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('updatedBy', 'fullName email')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        themes,
      },
    });
  } catch (error) {
    logger.error('Error getting theme history', {
      error: error.message,
      stack: error.stack,
    });
    next(createError('Failed to get theme history', 500));
  }
};

/**
 * Upload logo image (admin only)
 * Handles file upload and returns the logo URL
 */
export const uploadLogo = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    // Generate the full URL for the uploaded logo
    const logoUrl = `${config.server.baseUrl}/uploads/${req.file.filename}`;

    logger.info('Logo uploaded successfully', {
      userId,
      filename: req.file.filename,
      logoUrl,
    });

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    logger.error('Error uploading logo', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    next(createError('Failed to upload logo', 500));
  }
};

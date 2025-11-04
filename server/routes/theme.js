/**
 * Theme Routes
 * Site-wide theme management
 */

import express from 'express';
import {
  getActiveTheme,
  updateTheme,
  resetTheme,
  getThemeHistory,
  uploadLogo,
} from '../controllers/theme.js';
import Auth from '../middlewares/auth.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { Upload } from '../middlewares/upload.js';

const router = express.Router();

// Public route - get active theme (all users need this)
router.get('/active', getActiveTheme);

// Admin routes - require authentication and admin role
router.get('/history', Auth, checkAdmin, getThemeHistory);
router.put('/update', Auth, checkAdmin, updateTheme);
router.post('/reset', Auth, checkAdmin, resetTheme);
router.post('/upload-logo', Auth, checkAdmin, Upload.single('logo'), uploadLogo);

export default router;

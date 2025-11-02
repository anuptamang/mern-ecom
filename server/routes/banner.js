import express from 'express';
import {
  getBannerSlides,
  getBannerSlide,
  createBannerSlide,
  updateBannerSlide,
  deleteBannerSlide,
  reorderBannerSlides,
} from '../controllers/banner.js';
import Auth from '../middlewares/auth.js';
import checkAdmin from '../middlewares/checkAdmin.js';

const router = express.Router();

// Public routes - get banner slides
router.get('/', getBannerSlides);
router.get('/:id', getBannerSlide);

// Admin routes - require authentication and admin role
router.post('/', Auth, checkAdmin, createBannerSlide);
router.put('/:id', Auth, checkAdmin, updateBannerSlide);
router.delete('/:id', Auth, checkAdmin, deleteBannerSlide);
router.post('/reorder', Auth, checkAdmin, reorderBannerSlides);

export default router;

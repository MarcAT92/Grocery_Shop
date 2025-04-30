import express from 'express';
import { adminLogin, getAdminProfile, adminLogout } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Protected routes
router.get('/profile', protectAdmin, getAdminProfile);

export default router;

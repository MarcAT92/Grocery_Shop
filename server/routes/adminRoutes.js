import express from 'express';
import { adminLogin, adminLogout } from '../controllers/adminController.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

export default router;

import express from 'express';
import { syncUser, getCurrentUser } from '../controllers/userController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to sync user data from Clerk
router.post('/sync', syncUser);

// Protected route to get current user
router.get('/me', verifyAuth, getCurrentUser);

export default router;

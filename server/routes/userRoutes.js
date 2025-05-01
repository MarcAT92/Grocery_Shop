import express from 'express';
import { syncUser, getCurrentUser } from '../controllers/userController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Route to sync user data from Clerk
userRouter.post('/sync', syncUser);

// Protected route to get current user
userRouter.get('/me', verifyAuth, getCurrentUser);

export default userRouter;

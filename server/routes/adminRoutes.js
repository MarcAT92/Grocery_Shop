import express from 'express';
import { adminLogin, adminLogout, validateToken, getAdminSessions } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const adminRouter = express.Router();

// Public routes
adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminLogout);

// Protected routes
adminRouter.get('/validate-token', protectAdmin, validateToken);
adminRouter.get('/sessions', protectAdmin, getAdminSessions);

export default adminRouter;

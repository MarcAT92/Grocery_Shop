import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders } from '../controllers/orderController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const orderRouter = express.Router();

// User routes - protected with verifyAuth middleware
orderRouter.post('/create', verifyAuth, createOrder);
orderRouter.post('/myorders', verifyAuth, getMyOrders);
orderRouter.post('/details', verifyAuth, getOrderById);
orderRouter.post('/cancel', verifyAuth, cancelOrder);

// Admin routes - protected with protectAdmin middleware
orderRouter.get('/admin/all', protectAdmin, getAllOrders);

export default orderRouter;

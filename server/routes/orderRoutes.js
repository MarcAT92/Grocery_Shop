import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// All routes are protected with verifyAuth middleware
orderRouter.post('/create', verifyAuth, createOrder);
orderRouter.post('/myorders', verifyAuth, getMyOrders);
orderRouter.post('/details', verifyAuth, getOrderById);
orderRouter.post('/cancel', verifyAuth, cancelOrder);

export default orderRouter;

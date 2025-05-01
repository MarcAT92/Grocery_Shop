import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';

const cartRouter = express.Router();

// Get cart
cartRouter.post('/', getCart);

// Add item to cart
cartRouter.post('/add', addToCart);

// Update cart item
cartRouter.put('/update', updateCartItem);

// Remove item from cart
cartRouter.delete('/remove', removeFromCart);

// Clear cart
cartRouter.delete('/clear', clearCart);

export default cartRouter;
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// Get cart for a user
// @route   POST /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID is required'
            });
        }

        // Use clerkId as userId
        const userId = clerkId;

        // Find cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        // Populate product details
        const populatedCart = await Cart.findById(cart._id).lean();

        // Get product details for each item
        const cartWithProducts = [];
        for (const item of populatedCart.items) {
            const product = await Product.findById(item.productId).lean();
            if (product) {
                cartWithProducts.push({
                    ...item,
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        offerPrice: product.offerPrice,
                        image: product.image,
                        inStock: product.inStock
                    }
                });
            }
        }

        // Calculate total
        const total = await cart.calculateTotal();

        // Convert to format expected by frontend
        const formattedCart = {};
        cartWithProducts.forEach(item => {
            formattedCart[item.productId] = item.quantity;
        });

        res.json({
            success: true,
            cart: formattedCart,
            cartDetails: {
                _id: populatedCart._id,
                userId: populatedCart.userId,
                items: cartWithProducts,
                total,
                updatedAt: populatedCart.updatedAt
            }
        });
    } catch (error) {
        console.error('Get cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error getting cart',
            error: error.message
        });
    }
};

// Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { clerkId, productId, quantity = 1 } = req.body;

        if (!clerkId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID and Product ID are required'
            });
        }

        // Use clerkId as userId
        const userId = clerkId;

        // Check if product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.inStock) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        // Find cart or create a new one
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if product already in cart
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            cart.items.push({ productId, quantity });
        }

        cart.updatedAt = Date.now();
        await cart.save();

        // Convert to format expected by frontend
        const formattedCart = {};
        cart.items.forEach(item => {
            formattedCart[item.productId.toString()] = item.quantity;
        });

        res.json({
            success: true,
            message: 'Item added to cart',
            cart: formattedCart
        });
    } catch (error) {
        console.error('Add to cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error adding to cart',
            error: error.message
        });
    }
};

// Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { clerkId, productId, quantity } = req.body;

        if (!clerkId || !productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID, Product ID, and quantity are required'
            });
        }

        // Use clerkId as userId
        const userId = clerkId;

        // Find cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        cart.updatedAt = Date.now();
        await cart.save();

        // Convert to format expected by frontend
        const formattedCart = {};
        cart.items.forEach(item => {
            formattedCart[item.productId.toString()] = item.quantity;
        });

        res.json({
            success: true,
            message: 'Cart updated',
            cart: formattedCart
        });
    } catch (error) {
        console.error('Update cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error updating cart',
            error: error.message
        });
    }
};

// Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { clerkId, productId } = req.body;

        if (!clerkId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID and Product ID are required'
            });
        }

        // Use clerkId as userId
        const userId = clerkId;

        // Find cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove item from cart
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        cart.updatedAt = Date.now();
        await cart.save();

        // Convert to format expected by frontend
        const formattedCart = {};
        cart.items.forEach(item => {
            formattedCart[item.productId.toString()] = item.quantity;
        });

        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: formattedCart
        });
    } catch (error) {
        console.error('Remove from cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error removing from cart',
            error: error.message
        });
    }
};

// Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID is required'
            });
        }

        // Use clerkId as userId
        const userId = clerkId;

        // Find cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Clear cart items
        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();

        // Convert to format expected by frontend
        const formattedCart = {};
        // Cart is empty, so formattedCart remains an empty object

        res.json({
            success: true,
            message: 'Cart cleared',
            cart: formattedCart
        });
    } catch (error) {
        console.error('Clear cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error clearing cart',
            error: error.message
        });
    }
};
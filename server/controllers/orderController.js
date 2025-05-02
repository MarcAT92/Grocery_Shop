import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Address from '../models/addressModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { generateOrderNumber } from '../utils/orderUtils.js';
import { logger } from '../utils/logger.js';

// @desc    Create a new order
// @route   POST /api/orders/create
// @access  Private
// @desc    Get user orders
// @route   POST /api/orders/myorders
// @access  Private
// @desc    Get order by ID
// @route   POST /api/orders/details
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const { orderId, clerkId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if the order belongs to the user
        if (order.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        // Calculate if the order is within the cancellation window (1 hour)
        const orderTime = new Date(order.createdAt).getTime();
        const currentTime = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;
        const canCancel = currentTime - orderTime <= oneHourInMs;

        // Convert order to object to add the canCancel property
        const orderObj = order.toObject();
        orderObj.canCancel = canCancel;

        res.json({
            success: true,
            order: orderObj
        });
    } catch (error) {
        logger.error('OrderController', 'Get order by ID error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting order',
            error: error.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find all orders for the user
        const orders = await Order.find({ userId: clerkId }).sort({ createdAt: -1 });

        // Populate product details for each order item
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const orderObj = order.toObject();

            // For each order item, get the full product details
            const populatedItems = await Promise.all(orderObj.orderItems.map(async (item) => {
                try {
                    const product = await Product.findById(item.product);
                    return {
                        ...item,
                        product: product ? {
                            _id: product._id,
                            name: product.name,
                            category: product.category,
                            image: product.image,
                            price: product.price,
                            offerPrice: product.offerPrice,
                            inStock: product.inStock
                        } : {
                            _id: item.product,
                            name: item.name,
                            image: [item.image],
                            offerPrice: item.price
                        }
                    };
                } catch (error) {
                    console.error(`Error populating product ${item.product}:`, error);
                    return item;
                }
            }));

            return {
                ...orderObj,
                orderItems: populatedItems,
                amount: orderObj.totalPrice // Add amount field for frontend compatibility
            };
        }));

        res.json({
            success: true,
            count: populatedOrders.length,
            orders: populatedOrders
        });
    } catch (error) {
        logger.error('OrderController', 'Get my orders error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting orders',
            error: error.message
        });
    }
};

// @desc    Cancel an order
// @route   POST /api/orders/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const { orderId, clerkId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if the order belongs to the user
        if (order.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if the order is already delivered or cancelled
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}`
            });
        }

        // Check if the order is within the cancellation window (1 hour)
        const orderTime = new Date(order.createdAt).getTime();
        const currentTime = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;

        if (currentTime - orderTime > oneHourInMs) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled after 1 hour. Please contact customer support.'
            });
        }

        // Delete the order from the database completely
        await Order.findByIdAndDelete(orderId);

        res.json({
            success: true,
            message: 'Order cancelled and removed successfully'
        });
    } catch (error) {
        logger.error('OrderController', 'Cancel order error', error);
        res.status(500).json({
            success: false,
            message: 'Server error cancelling order',
            error: error.message
        });
    }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin/all
// @access  Admin
export const getAllOrders = async (req, res) => {
    try {
        // Find all orders, sort by most recent first
        const orders = await Order.find().sort({ createdAt: -1 });

        // Populate product details for each order item
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const orderObj = order.toObject();

            // For each order item, get the full product details
            const populatedItems = await Promise.all(orderObj.orderItems.map(async (item) => {
                try {
                    const product = await Product.findById(item.product);
                    return {
                        ...item,
                        product: product ? {
                            _id: product._id,
                            name: product.name,
                            category: product.category,
                            image: product.image,
                            price: product.price,
                            offerPrice: product.offerPrice,
                            inStock: product.inStock
                        } : {
                            _id: item.product,
                            name: item.name,
                            image: [item.image],
                            offerPrice: item.price
                        }
                    };
                } catch (error) {
                    console.error(`Error populating product ${item.product}:`, error);
                    return item;
                }
            }));

            // Try to get user details
            let userDetails = null;
            try {
                const user = await User.findOne({ clerkId: orderObj.userId });
                if (user) {
                    userDetails = {
                        name: user.name,
                        email: user.email
                    };
                }
            } catch (error) {
                console.error(`Error getting user details for ${orderObj.userId}:`, error);
            }

            return {
                ...orderObj,
                orderItems: populatedItems,
                amount: orderObj.totalPrice, // Add amount field for frontend compatibility
                user: userDetails
            };
        }));

        res.json({
            success: true,
            count: populatedOrders.length,
            orders: populatedOrders
        });
    } catch (error) {
        logger.error('OrderController', 'Get all orders error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting orders',
            error: error.message
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { clerkId, addressId, paymentMethod, deliveryMethod = 'Delivery' } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID is required'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        // Get the user's cart
        const cart = await Cart.findOne({ userId: clerkId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Get the shipping address
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if the address belongs to the user
        if (address.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to use this address'
            });
        }

        // Calculate order total and prepare order items
        let orderItems = [];
        let orderTotal = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`
                });
            }

            if (!product.inStock) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} is out of stock`
                });
            }

            const itemTotal = product.offerPrice * item.quantity;
            orderTotal += itemTotal;

            orderItems.push({
                product: item.productId,
                name: product.name,
                image: product.image[0],
                price: product.offerPrice,
                quantity: item.quantity,
                itemTotal
            });
        }

        // Calculate tax and final total
        const taxRate = 0.02; // 2% tax
        const taxAmount = orderTotal * taxRate;
        const finalTotal = orderTotal + taxAmount;

        // Generate a unique order number
        let orderNumber;
        let isUnique = false;
        let maxAttempts = 10;
        let attempts = 0;

        // Keep generating order numbers until we find a unique one
        // or reach the maximum number of attempts
        while (!isUnique && attempts < maxAttempts) {
            orderNumber = generateOrderNumber();
            // Check if this order number already exists
            const existingOrder = await Order.findOne({ orderNumber });
            if (!existingOrder) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate a unique order number. Please try again.'
            });
        }

        // Create the order with the unique order number
        const order = await Order.create({
            orderNumber,
            userId: clerkId,
            orderItems,
            shippingAddress: {
                addressId: address._id,
                firstName: address.firstName,
                lastName: address.lastName,
                phoneNumber: address.phoneNumber,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country
            },
            paymentMethod,
            deliveryMethod,
            itemsPrice: orderTotal,
            taxPrice: taxAmount,
            totalPrice: finalTotal,
            isPaid: paymentMethod === 'Cash on Delivery' ? false : true,
            paidAt: paymentMethod === 'Cash on Delivery' ? null : Date.now()
        });

        // Clear the cart after successful order creation
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        logger.error('OrderController', 'Create order error', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating order',
            error: error.message
        });
    }
};

// @desc    Get order by ID (admin only)
// @route   GET /api/orders/admin/details/:id
// @access  Admin
export const getOrderByIdAdmin = async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Try to get user details
        let userDetails = null;
        try {
            const user = await User.findOne({ clerkId: order.userId });
            if (user) {
                userDetails = {
                    name: user.name,
                    email: user.email
                };
            }
        } catch (error) {
            console.error(`Error getting user details for ${order.userId}:`, error);
        }

        // Convert order to object to add the user property
        const orderObj = order.toObject();
        orderObj.user = userDetails;

        res.json({
            success: true,
            order: orderObj
        });
    } catch (error) {
        logger.error('OrderController', 'Get order by ID (admin) error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting order',
            error: error.message
        });
    }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/admin/update-status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, isPaid } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.status = status;

        // Update delivery status if status is 'Delivered'
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        // Update payment status only for Cash on Delivery orders
        if (order.paymentMethod === 'Cash on Delivery' && isPaid !== undefined) {
            order.isPaid = isPaid;
            if (isPaid) {
                order.paidAt = Date.now();
            } else {
                order.paidAt = null;
            }
        }

        // Save the updated order
        await order.save();

        // Log admin action
        if (req.admin) {
            logger.admin(
                req.admin.id,
                req.admin.email,
                'UPDATE_ORDER_STATUS',
                `Updated order ${orderId} status to ${status}, isPaid: ${isPaid}`
            );
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        logger.error('OrderController', 'Update order status error', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating order status',
            error: error.message
        });
    }
};
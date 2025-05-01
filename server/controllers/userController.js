import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';

// @desc    Create or update user from Clerk frontend data
// @route   POST /api/users/sync
// @access  Public (but requires Clerk token)
export const syncUser = async (req, res) => {
    try {
        const { clerkId, firstName, lastName, email, imageUrl } = req.body;

        if (!clerkId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Clerk ID and email are required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ clerkId });

        if (user) {
            // Update existing user
            user = await User.findOneAndUpdate(
                { clerkId },
                {
                    name: `${firstName || ''} ${lastName || ''}`.trim(),
                    email,
                    imageUrl: imageUrl || ''
                },
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                user
            });
        } else {
            // Create a new cart for the user
            const cart = new Cart({
                userId: clerkId,
                items: []
            });
            await cart.save();

            // Create new user with cart reference
            const newUser = await User.create({
                clerkId,
                name: `${firstName || ''} ${lastName || ''}`.trim(),
                email,
                imageUrl: imageUrl || '',
                cart: cart._id
            });

            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: newUser
            });
        }
    } catch (error) {
        console.error('Sync user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error syncing user',
            error: error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        // Check if user exists in the database
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile',
            error: error.message
        });
    }
};

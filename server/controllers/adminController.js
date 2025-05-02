import Admin from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET || 'admin-secret-key', {
        expiresIn: '1d' // Token expires in 1 day
    });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email }).select('+password');

        // Check if admin exists and password is correct
        if (admin && (await admin.matchPassword(password))) {
            // Generate JWT token
            const token = generateToken(admin._id);

            // Set token in cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            // Log successful login
            logger.admin(admin._id, admin.email, 'LOGIN', 'Admin logged in successfully');

            // Return admin data (without password)
            res.json({
                success: true,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email
                },
                token
            });
        } else {
            logger.warn('AdminAuth', `Failed login attempt for email: ${email}`);
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        logger.error('AdminAuth', 'Admin login error', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin login',
            error: error.message
        });
    }
};



// @desc    Admin logout
// @route   POST /api/admin/logout
// @access  Public
export const adminLogout = (req, res) => {
    // Log admin logout if admin info is available
    if (req.admin) {
        logger.admin(req.admin.id, req.admin.email, 'LOGOUT', 'Admin logged out');
    } else {
        logger.info('AdminAuth', 'Admin logout (admin info not available)');
    }

    res.cookie('adminToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: 'Admin logged out successfully'
    });
};



import Admin from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { trackAdminSession, removeAdminSession, shouldForceLogout, clearForceLogout, getActiveSessions } from '../utils/sessionManager.js';

// Generate JWT token
const generateToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
            name: admin.name, // Include admin name in the token
            isAdmin: true,
            lastUpdated: admin.lastUpdated.getTime() // Include lastUpdated timestamp
        },
        process.env.JWT_SECRET || 'admin-secret-key',
        {
            expiresIn: '1d' // Token expires in 1 day
        }
    );
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
            const token = generateToken(admin);

            // Set token in cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            // Track admin session with detailed info
            const shouldLogout = trackAdminSession(admin._id, token);
            logger.info('AdminAuth', `Admin session created for ${admin.email} (${admin._id})`);

            // Log active sessions after login
            const sessions = getActiveSessions();
            logger.debug('AdminAuth', `Active sessions after login: ${sessions.length}`);
            sessions.forEach(session => {
                logger.debug('AdminAuth', `Session: ${session.adminId}, forceLogout: ${session.forceLogout}`);
            });

            // If this admin should be forced to logout, return an error
            if (shouldLogout) {
                logger.warn('AdminAuth', `Admin ${admin.email} (${admin._id}) credentials have been updated, rejecting login`);
                return res.status(401).json({
                    success: false,
                    message: 'Your credentials have been updated. Please use your new credentials to log in.',
                    code: 'CREDENTIALS_UPDATED'
                });
            }

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
        // Remove admin session
        removeAdminSession(req.admin.id);

        // Clear force logout flag if present
        clearForceLogout(req.admin.id);

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

// @desc    Validate admin token
// @route   GET /api/admin/validate-token
// @access  Admin
export const validateToken = (req, res) => {
    // If middleware passed, token is valid
    // The admin object is already attached to the request by the middleware
    if (req.admin) {
        // Check if admin should be forced to logout
        if (shouldForceLogout(req.admin.id)) {
            logger.info('AdminAuth', `Force logout for admin ${req.admin.email} (${req.admin.id})`);

            // Add detailed information to the response
            return res.status(401).json({
                success: false,
                message: 'Your credentials have been updated. Please log in again.',
                code: 'CREDENTIALS_UPDATED',
                details: {
                    reason: 'Admin credentials were updated via admin:edit script',
                    timestamp: new Date().toISOString()
                }
            });
        }

        logger.info('AdminAuth', `Token validated for admin ${req.admin.email} (${req.admin.id})`);
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            admin: {
                id: req.admin.id,
                name: req.admin.name,
                email: req.admin.email
            }
        });
    }

    // This should never happen if middleware is working correctly
    logger.error('AdminAuth', 'Token validation failed - admin not found in request');
    return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
    });
};

// @desc    Get active admin sessions (for debugging)
// @route   GET /api/admin/sessions
// @access  Admin
export const getAdminSessions = (req, res) => {
    if (!req.admin) {
        logger.warn('AdminAuth', 'Unauthorized attempt to view admin sessions');
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view admin sessions'
        });
    }

    const sessions = getActiveSessions();
    logger.info('AdminAuth', `Admin sessions retrieved by ${req.admin.email}`);

    return res.status(200).json({
        success: true,
        sessions
    });
};



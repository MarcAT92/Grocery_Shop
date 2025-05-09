import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import { logger } from '../utils/logger.js';
import { shouldForceLogout } from '../utils/sessionManager.js';

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Get token from cookie or authorization header
        if (req.cookies.adminToken) {
            token = req.cookies.adminToken;
            logger.debug('AdminAuth', 'Using token from cookie');
        } else if (req.headers.authorization) {
            // Always expect Bearer format from client
            if (req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
                logger.debug('AdminAuth', 'Using token from Authorization header with Bearer prefix');
            } else {
                // Fallback for direct token
                token = req.headers.authorization;
                logger.debug('AdminAuth', 'Using token from Authorization header without Bearer prefix');
            }
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
        } catch (error) {
            logger.error('AdminAuth', 'Token verification failed', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        }

        // Check if the token is for an admin
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized as admin'
            });
        }

        // Find admin by id from decoded token
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if admin credentials have been updated since token was issued
        const tokenLastUpdated = decoded.lastUpdated;
        const adminLastUpdated = admin.lastUpdated.getTime();

        // Check if admin should be forced to logout
        if (shouldForceLogout(admin._id)) {
            logger.warn('AdminAuth', `Admin ${admin.email} (${admin._id}) forced logout due to credential change`);

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

        // Check if token is outdated based on lastUpdated timestamp
        if (tokenLastUpdated < adminLastUpdated) {
            logger.warn('AdminAuth', `Admin ${admin.email} (${admin._id}) token is outdated due to credential change`);
            return res.status(401).json({
                success: false,
                message: 'Your credentials have been updated. Please log in again.',
                code: 'CREDENTIALS_UPDATED'
            });
        }

        // Set admin in request object with full details for logging
        req.admin = {
            id: admin._id,
            name: admin.name,
            email: admin.email
        };

        // Also include the admin name from the token if available
        if (decoded.name) {
            req.admin.name = decoded.name;
        }

        logger.info('AdminAuth', `Admin ${admin.email} (${admin._id}) authenticated successfully`);
        next();
    } catch (error) {
        logger.error('AdminAuth', 'Admin authentication failed', error);
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
            error: error.message
        });
    }
};

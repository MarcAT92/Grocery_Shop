import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Get token from cookie or authorization header
        if (req.cookies.adminToken) {
            token = req.cookies.adminToken;
        } else if (req.headers.authorization) {
            // Handle both formats: with or without 'Bearer' prefix
            token = req.headers.authorization.startsWith('Bearer')
                ? req.headers.authorization.split(' ')[1]
                : req.headers.authorization;
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
            console.error('Token verification failed:', error.message);
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

        // Set admin in request object
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
            error: error.message
        });
    }
};

import User from '../models/userModel.js';

// Middleware to verify Clerk session token
export const verifyAuth = async (req, res, next) => {
    try {
        // Get the token from the authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }
        
        // Extract the token
        const token = authHeader.split(' ')[1];
        
        // Get the Clerk user ID from the request
        // This is sent by the frontend after Clerk authentication
        const { clerkId } = req.body;
        
        if (!clerkId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Clerk ID is required' 
            });
        }
        
        // Find the user in the database
        const user = await User.findOne({ clerkId });
        
        // If user doesn't exist, we'll create them in the controller
        // Just pass the clerkId to the next middleware
        req.clerkId = clerkId;
        
        // If user exists, attach to request
        if (user) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

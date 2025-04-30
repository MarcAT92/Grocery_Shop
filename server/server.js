import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import 'dotenv/config';

// Import routes
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import models
import Admin from './models/adminModel.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB();

// Create initial admin user if none exists
try {
    const adminExists = await Admin.findOne({});

    if (!adminExists) {
        await Admin.create({
            name: process.env.ADMIN_NAME || 'Admin User',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: process.env.ADMIN_PASSWORD || 'admin123'
        });
        console.log('Initial admin user created');
    }
} catch (error) {
    console.error('Error creating initial admin:', error.message);
}

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173']

// Middleware configuration
app.use(express.json());
app.use(cookieParser())
app.use(cors({origin: allowedOrigins, credentials: true}))

// Base route
app.get('/', (req, res) => res.send("API is Working") )

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Start server
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`) )

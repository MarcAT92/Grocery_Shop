import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import { logger } from './utils/logger.js';
import 'dotenv/config';

// Import routes
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoutes.js';
import orderRouter from './routes/orderRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173']

// Middleware configuration
app.use(express.json());
app.use(cookieParser())
app.use(cors({origin: allowedOrigins, credentials: true}))

// Base route
app.get('/', (req, res) => res.send("API is Working") )

// Routes
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/orders', orderRouter);

// Start server
app.listen(port, () => {
    logger.info('Server', `Server is running on http://localhost:${port}`);
    logger.info('Server', `Environment: ${process.env.NODE_ENV || 'development'}`);
})

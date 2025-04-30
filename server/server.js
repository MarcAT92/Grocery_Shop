import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';

// Import routes
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB();

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

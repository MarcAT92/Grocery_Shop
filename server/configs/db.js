import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            logger.info('Database', 'MongoDB connection established successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('Database', 'MongoDB connection error', err);
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/groceryshop`);
    } catch (error) {
        logger.error('Database', 'Failed to connect to MongoDB', error);
    }
}

export default connectDB;
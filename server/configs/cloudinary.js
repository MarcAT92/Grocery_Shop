import {v2 as cloudinary} from 'cloudinary';
import { logger } from '../utils/logger.js';

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        logger.info('Cloudinary', 'Cloudinary configuration initialized');
    } catch (error) {
        logger.error('Cloudinary', 'Failed to initialize Cloudinary configuration', error);
    }
}

export default connectCloudinary;
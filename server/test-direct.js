import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/groceryshop`);
        console.log('MongoDB Connected');
        
        // Define User Schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        });
        
        // Create User model
        const User = mongoose.model('User', userSchema);
        
        // Check if test user exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        
        if (existingUser) {
            console.log('Test user already exists:', existingUser);
        } else {
            // Create a test user
            const hashedPassword = await bcrypt.hash('password123', 10);
            const newUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword
            });
            
            await newUser.save();
            console.log('Test user created:', newUser);
        }
        
        // Find all users
        const allUsers = await User.find();
        console.log('All users:', allUsers);
        
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB Connection Closed');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// Run the test
connectDB();

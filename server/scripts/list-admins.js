import mongoose from 'mongoose';
import 'dotenv/config';
import Admin from '../models/adminModel.js';

// Connect to MongoDB and list all admin users
const listAdmins = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URI}/groceryshop`);
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await Admin.find({}).select('-password');

    if (admins.length === 0) {
      console.log('No admin users found');
    } else {
      console.log(`\nFound ${admins.length} admin user(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`Admin #${index + 1}:`);
        console.log(`ID: ${admin._id}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Created: ${admin.createdAt}`);
        console.log('-----------------------------------');
      });
    }

  } catch (error) {
    console.error('Error listing admins:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
};

// Run the function
listAdmins();

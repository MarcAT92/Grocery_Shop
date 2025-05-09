import mongoose from 'mongoose';
import readline from 'readline';
import 'dotenv/config';
import Admin from '../models/adminModel.js';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Connect to MongoDB and create admin user
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URI}/groceryshop`);
    console.log('Connected to MongoDB');

    // Get admin details from user input
    const name = await prompt('Enter admin name: ');
    const email = await prompt('Enter admin email: ');
    const password = await prompt('Enter admin password: ');

    // Validate input
    if (!name || !email || !password) {
      console.error('Error: Name, email, and password are required');
      process.exit(1);
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error(`Error: Admin with email ${email} already exists`);
      process.exit(1);
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      lastUpdated: new Date() // Set initial lastUpdated timestamp
    });

    console.log(`\nAdmin created successfully:`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`ID: ${admin._id}`);

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    // Close MongoDB connection and readline interface
    await mongoose.connection.close();
    rl.close();
  }
};

// Run the function
createAdmin();

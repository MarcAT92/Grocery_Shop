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

// Connect to MongoDB and delete admin user
const deleteAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URI}/groceryshop`);
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await Admin.find({}).select('-password');

    if (admins.length === 0) {
      console.log('No admin users found');
      process.exit(0);
    }

    console.log(`\nFound ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

    // Get admin to delete
    const selection = await prompt('\nEnter the number of the admin to delete (or 0 to cancel): ');
    const index = parseInt(selection) - 1;

    if (selection === '0' || isNaN(index) || index < 0 || index >= admins.length) {
      console.log('Operation cancelled');
      process.exit(0);
    }

    const selectedAdmin = admins[index];

    // Confirm deletion
    const confirm = await prompt(`Are you sure you want to delete admin "${selectedAdmin.name}" (${selectedAdmin.email})? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      process.exit(0);
    }

    // Check if this is the last admin
    if (admins.length === 1) {
      console.error('Error: Cannot delete the last admin user');
      process.exit(1);
    }

    // Delete the admin
    await Admin.findByIdAndDelete(selectedAdmin._id);
    console.log(`\nAdmin "${selectedAdmin.name}" (${selectedAdmin.email}) deleted successfully`);

  } catch (error) {
    console.error('Error deleting admin:', error.message);
  } finally {
    // Close MongoDB connection and readline interface
    await mongoose.connection.close();
    rl.close();
  }
};

// Run the function
deleteAdmin();

import mongoose from 'mongoose';
import readline from 'readline';
import 'dotenv/config';
import Admin from '../models/adminModel.js';
import { logger } from '../utils/logger.js';
import { forceLogoutAdmin, getActiveSessions } from '../utils/sessionManager.js';

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

// Connect to MongoDB and edit admin user
const editAdmin = async () => {
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

    // Get admin to edit
    const selection = await prompt('\nEnter the number of the admin to edit (or 0 to cancel): ');
    const index = parseInt(selection) - 1;

    if (selection === '0' || isNaN(index) || index < 0 || index >= admins.length) {
      console.log('Operation cancelled');
      process.exit(0);
    }

    const selectedAdmin = admins[index];
    console.log(`\nEditing admin: ${selectedAdmin.name} (${selectedAdmin.email})`);

    // Get updated information
    console.log('\nLeave field empty to keep current value');

    const newName = await prompt(`Name [${selectedAdmin.name}]: `);
    const newEmail = await prompt(`Email [${selectedAdmin.email}]: `);
    const newPassword = await prompt('New Password (leave empty to keep current): ');

    // Confirm changes
    console.log('\nSummary of changes:');
    console.log(`Name: ${selectedAdmin.name} -> ${newName || '(unchanged)'}`);
    console.log(`Email: ${selectedAdmin.email} -> ${newEmail || '(unchanged)'}`);
    console.log(`Password: ${newPassword ? '********' : '(unchanged)'}`);

    const confirm = await prompt('\nApply these changes? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      process.exit(0);
    }

    // Prepare update object
    const updateData = {
      // Always update the lastUpdated timestamp when credentials are changed
      lastUpdated: new Date()
    };
    if (newName) updateData.name = newName;
    if (newEmail) updateData.email = newEmail;
    if (newPassword) updateData.password = newPassword;

    // Check if email is already in use by another admin
    if (newEmail && newEmail !== selectedAdmin.email) {
      const existingAdmin = await Admin.findOne({ email: newEmail });
      if (existingAdmin) {
        console.error(`Error: Email ${newEmail} is already in use by another admin`);
        process.exit(1);
      }
    }

    // Update admin
    // If password is being updated, we need to use a different approach to ensure password hashing
    let updatedAdmin;

    if (newPassword) {
      // Fetch the admin document first
      const admin = await Admin.findById(selectedAdmin._id);

      // Update fields
      if (newName) admin.name = newName;
      if (newEmail) admin.email = newEmail;
      admin.password = newPassword; // This will trigger the pre-save middleware for password hashing
      admin.lastUpdated = new Date();

      // Save the document to trigger the pre-save middleware
      updatedAdmin = await admin.save();
    } else {
      // If not updating password, we can use findByIdAndUpdate
      updatedAdmin = await Admin.findByIdAndUpdate(
        selectedAdmin._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    console.log(`\nAdmin updated successfully:`);
    console.log(`Name: ${updatedAdmin.name}`);
    console.log(`Email: ${updatedAdmin.email}`);
    console.log(`ID: ${updatedAdmin._id}`);

    try {
      // Force logout the admin if they're currently logged in
      const wasForced = forceLogoutAdmin(selectedAdmin._id);

      // Get current active sessions for verification
      const sessions = getActiveSessions();
      const adminSession = sessions.find(s => s.adminId === selectedAdmin._id.toString());
      const hasActiveSession = !!adminSession;
      const forceLogoutSet = adminSession?.forceLogout === true;

      // Log the action with detailed information
      logger.admin(
        'SYSTEM',
        'SYSTEM',
        'EDIT_ADMIN',
        `Admin ${selectedAdmin._id} updated via admin:edit script. Active session: ${hasActiveSession}, Force logout flag: ${forceLogoutSet}`
      );

      console.log('\n---------------------------------------------');
      console.log('IMPORTANT: Admin credentials have been updated.');
      console.log('A force logout flag has been set for this admin account.');

      if (hasActiveSession) {
        console.log('An active session was found and will be terminated.');
        console.log('The admin will be logged out automatically within 10 seconds.');
      } else {
        console.log('No active session was found.');
        console.log('If the admin tries to log in with old credentials, they will be rejected.');
      }

      console.log('The admin will need to log in with the new credentials.');
      console.log('---------------------------------------------');
    } catch (error) {
      console.error('Error setting force logout flag:', error.message);
      logger.error('SessionManager', 'Error setting force logout flag', error);
    }

  } catch (error) {
    console.error('Error editing admin:', error.message);
  } finally {
    // Close MongoDB connection and readline interface
    await mongoose.connection.close();
    rl.close();
  }
};

// Run the function
editAdmin();

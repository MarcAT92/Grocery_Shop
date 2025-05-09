import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in query results by default
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password before saving
adminSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with the new salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check if entered password is correct
adminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

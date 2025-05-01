import mongoose from 'mongoose';

const addressSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    firstName: {
        type: String,
        required: [true, 'Please provide a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide a last name']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number']
    },
    addressLine1: {
        type: String,
        required: [true, 'Please provide address line 1']
    },
    addressLine2: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: [true, 'Please provide a city']
    },
    state: {
        type: String,
        required: [true, 'Please provide a state']
    },
    postalCode: {
        type: String,
        required: [true, 'Please provide a postal code']
    },
    country: {
        type: String,
        required: [true, 'Please provide a country'],
        default: 'United States'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Address = mongoose.models.address || mongoose.model('address', addressSchema);

export default Address;
import Address from '../models/addressModel.js';
import User from '../models/userModel.js';

// @desc    Add a new address
// @route   POST /api/address/add
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const {
            clerkId,
            firstName,
            lastName,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault
        } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if this is the first address for the user
        const existingAddresses = await Address.find({ userId: clerkId });
        const isFirstAddress = existingAddresses.length === 0;

        // Create new address
        const addressData = {
            userId: clerkId,
            firstName,
            lastName,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country: country || 'Jamaica',
            // If it's the first address or isDefault is true, set as default
            isDefault: isFirstAddress || isDefault || false
        };

        // If this is the default address or the first address, unset any existing default
        if (isDefault || isFirstAddress) {
            await Address.updateMany(
                { userId: clerkId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create(addressData);

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address
        });
    } catch (error) {
        console.error('Add address error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error adding address',
            error: error.message
        });
    }
};

// @desc    Get all addresses for a user
// @route   POST /api/address/list
// @access  Private
export const getAddresses = async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find all addresses for the user
        const addresses = await Address.find({ userId: clerkId }).sort({ isDefault: -1, createdAt: -1 });

        res.json({
            success: true,
            count: addresses.length,
            addresses
        });
    } catch (error) {
        console.error('Get addresses error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error getting addresses',
            error: error.message
        });
    }
};

// @desc    Update an address
// @route   PUT /api/address/update
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const {
            addressId,
            clerkId,
            firstName,
            lastName,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault
        } = req.body;

        if (!addressId || !clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID and User ID are required'
            });
        }

        // Find the address
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if the address belongs to the user
        if (address.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this address'
            });
        }

        // Check if there are any other addresses
        const otherAddresses = await Address.find({
            userId: clerkId,
            _id: { $ne: addressId }
        });

        // If this is being set as default, unset any existing default
        if (isDefault) {
            await Address.updateMany(
                { userId: clerkId, isDefault: true },
                { $set: { isDefault: false } }
            );
        } else if (!isDefault && address.isDefault && otherAddresses.length > 0) {
            // If this was the default address and is being unset, prevent it
            return res.status(400).json({
                success: false,
                message: 'You must have at least one default address. Please set another address as default first.'
            });
        }

        // Update the address
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                firstName,
                lastName,
                phoneNumber,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                isDefault: isDefault || false
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Address updated successfully',
            address: updatedAddress
        });
    } catch (error) {
        console.error('Update address error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error updating address',
            error: error.message
        });
    }
};

// @desc    Delete an address
// @route   DELETE /api/address/delete
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const { addressId, clerkId } = req.body;

        if (!addressId || !clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID and User ID are required'
            });
        }

        // Find the address
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if the address belongs to the user
        if (address.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this address'
            });
        }

        // Check if this is the default address
        if (address.isDefault) {
            // Check if there are other addresses
            const otherAddresses = await Address.find({
                userId: clerkId,
                _id: { $ne: addressId }
            });

            if (otherAddresses.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete default address. Please set another address as default first.'
                });
            }
        }

        // Delete the address
        await Address.findByIdAndDelete(addressId);

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error deleting address',
            error: error.message
        });
    }
};

// @desc    Set an address as default
// @route   PUT /api/address/set-default
// @access  Private
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId, clerkId } = req.body;

        if (!addressId || !clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID and User ID are required'
            });
        }

        // Find the address
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if the address belongs to the user
        if (address.userId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this address'
            });
        }

        // Unset any existing default address
        await Address.updateMany(
            { userId: clerkId, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Set this address as default
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Default address set successfully',
            address: updatedAddress
        });
    } catch (error) {
        console.error('Set default address error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error setting default address',
            error: error.message
        });
    }
};

// @desc    Get default address for a user
// @route   POST /api/address/default
// @access  Private
export const getDefaultAddress = async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the default address
        const address = await Address.findOne({ userId: clerkId, isDefault: true });

        if (!address) {
            // If no default address, get the most recent one
            const mostRecent = await Address.findOne({ userId: clerkId }).sort({ createdAt: -1 });

            if (!mostRecent) {
                return res.status(404).json({
                    success: false,
                    message: 'No addresses found for this user'
                });
            }

            return res.json({
                success: true,
                address: mostRecent,
                isDefault: false
            });
        }

        res.json({
            success: true,
            address,
            isDefault: true
        });
    } catch (error) {
        console.error('Get default address error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error getting default address',
            error: error.message
        });
    }
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import AddressForm from './AddressForm';

const AddressList = ({ onSelectAddress, selectedAddressId, onEditAddress, onAddressUpdated }) => {
  const { getToken, userId } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch addresses when component mounts or when addresses are updated
  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  // Callback when addresses are updated
  useEffect(() => {
    if (addresses.length > 0 && onAddressUpdated) {
      onAddressUpdated(addresses);
    }
  }, [addresses, onAddressUpdated]);

  const fetchAddresses = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${apiUrl}/address/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clerkId: userId })
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(data.addresses);
      } else {
        toast.error(data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error loading addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${apiUrl}/address/set-default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId,
          clerkId: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Default address updated');
        fetchAddresses(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to update default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error updating default address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${apiUrl}/address/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId,
          clerkId: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Address deleted');
        fetchAddresses(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
    }
  };

  const handleAddressSaved = () => {
    fetchAddresses();
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address) => {
    if (onEditAddress) {
      onEditAddress(address);
    }
  };

  if (loading && addresses.length === 0) {
    return <div className="text-center py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            existingAddress={editingAddress}
            onSave={handleAddressSaved}
            onCancel={() => {
              setShowAddForm(false);
              setEditingAddress(null);
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Add New Address
        </button>
      )}

      {addresses.length === 0 && !showAddForm ? (
        <div className="text-center py-4 text-gray-500">
          You don't have any saved addresses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-4 ${selectedAddressId === address._id ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {address.firstName} {address.lastName}
                    </h3>
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.phoneNumber}</p>
                  <p className="text-gray-600">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-gray-600">{address.addressLine2}</p>
                  )}
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {onSelectAddress && (
                    <button
                      onClick={() => onSelectAddress(address)}
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedAddressId === address._id ? 'Selected' : 'Select'}
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;

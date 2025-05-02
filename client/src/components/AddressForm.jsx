import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

// Import countries from location data
import { countries } from '../data/locationData';

// Import location data from a separate file
import { stateCityMapping } from '../data/locationData';

// Generate statesByCountry from the mapping
const statesByCountry = {};

// Generate citiesByState mapping
const citiesByState = {};

// Generate all cities by country
const citiesByCountry = {};

// Initialize the data structures
for (const country in stateCityMapping) {
  // Get states for each country
  statesByCountry[country] = Object.keys(stateCityMapping[country]).sort();

  // Map cities to states for each country
  citiesByState[country] = {};
  for (const state in stateCityMapping[country]) {
    citiesByState[country][state] = stateCityMapping[country][state];
  }

  // Get all cities for each country
  const citiesSet = new Set();
  Object.values(stateCityMapping[country]).forEach(cities => {
    cities.forEach(city => citiesSet.add(city));
  });
  citiesByCountry[country] = Array.from(citiesSet).sort();
}

const AddressForm = ({ existingAddress = null, onSave, onCancel }) => {
  const { getToken, userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Trinidad and Tobago', // Default to Trinidad and Tobago
    isDefault: false
  });

  // State for available states and filtered cities based on selected country/state
  const [availableStates, setAvailableStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // If editing an existing address, populate the form
  useEffect(() => {
    if (existingAddress) {
      // Set the country first
      const country = existingAddress.country || 'Trinidad and Tobago';
      const availableStatesList = statesByCountry[country] || [];

      setFormData({
        firstName: existingAddress.firstName || '',
        lastName: existingAddress.lastName || '',
        phoneNumber: existingAddress.phoneNumber || '',
        addressLine1: existingAddress.addressLine1 || '',
        addressLine2: existingAddress.addressLine2 || '',
        city: existingAddress.city || '',
        state: existingAddress.state || '',
        postalCode: existingAddress.postalCode || '',
        country: country,
        isDefault: existingAddress.isDefault || false
      });

      // Update available options based on country
      setAvailableStates(availableStatesList);

      // If state is selected, filter cities based on state
      if (existingAddress.state) {
        const stateCities = citiesByState[country][existingAddress.state] || [];
        setFilteredCities(stateCities);
      } else {
        setFilteredCities([]);
      }
    }
  }, [existingAddress]);

  /**
   * Handle form field changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Handle special fields
    switch (name) {
      case 'country':
        // Reset dependent fields when country changes
        setFormData(prevData => ({
          ...prevData,
          city: '',
          state: '',
          [name]: newValue
        }));

        // Update available options
        setAvailableStates(statesByCountry[newValue] || []);
        setFilteredCities([]);
        break;

      case 'state':
        // Update state and reset city
        setFormData(prevData => ({
          ...prevData,
          [name]: newValue,
          city: ''
        }));

        // Update city options based on selected state
        if (newValue && formData.country) {
          setFilteredCities(citiesByState[formData.country][newValue] || []);
        } else {
          setFilteredCities([]);
        }
        break;

      case 'city':
        // Standard update for city
        setFormData(prevData => ({
          ...prevData,
          [name]: newValue
        }));
        break;

      default:
        // Standard field update
        setFormData(prevData => ({
          ...prevData,
          [name]: newValue
        }));
    }
  };

  // Update available states when component mounts or country changes
  useEffect(() => {
    setAvailableStates(statesByCountry[formData.country] || []);
    setFilteredCities([]);
  }, [formData.country]);

  // Update filtered cities when state changes
  useEffect(() => {
    if (formData.state && formData.country && formData.state !== 'other') {
      const stateCities = citiesByState[formData.country][formData.state] || [];
      setFilteredCities(stateCities);
    } else {
      setFilteredCities(citiesByCountry[formData.country] || []);
    }
  }, [formData.state, formData.country]);

  /**
   * Validate address fields before submission
   * @returns {Object} Object containing validation result and error message
   */
  const validateAddressFields = () => {
    const { country, city, state } = formData;

    // Required field validation
    if (!country) {
      return { isValid: false, message: 'Please select a country' };
    }

    if (!city) {
      return { isValid: false, message: 'Please provide a city' };
    }

    if (!state) {
      return { isValid: false, message: 'Please provide a state/province' };
    }

    // Data consistency validation
    const cityValid = citiesByCountry[country]?.includes(city);
    if (!cityValid && citiesByCountry[country]?.length > 0) {
      return {
        isValid: false,
        message: `The city you entered is not recognized for ${country}. Please select from the list.`
      };
    }

    const stateValid = statesByCountry[country]?.includes(state);
    if (!stateValid && statesByCountry[country]?.length > 0) {
      return {
        isValid: false,
        message: `The state/province you entered is not recognized for ${country}. Please select from the list.`
      };
    }

    return { isValid: true, message: '' };
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate address fields
    const { isValid, message } = validateAddressFields();
    if (!isValid) {
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // Determine if we're editing an existing address
      const isEditing = !!existingAddress;

      // Prepare request data
      const requestData = {
        ...formData,
        clerkId: userId,
        ...(isEditing && { addressId: existingAddress._id })
      };

      // Set endpoint based on operation type
      const endpoint = isEditing
        ? `${apiUrl}/address/update`
        : `${apiUrl}/address/add`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = isEditing ? 'Address updated!' : 'Address added!';
        toast.success(successMessage);
        if (onSave) onSave(data.address);
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Address form error:', error);
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select Caribbean Country</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700">State/Province</label>
          {availableStates.length > 0 ? (
            <div>
              <select
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                required={formData.state === ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select State/Province</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}

              </select>


            </div>
          ) : (
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="State/Province"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          {formData.state && filteredCities.length > 0 ? (
            <div>
              <select
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                required={formData.city === ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select City</option>
                {filteredCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}

              </select>


            </div>
          ) : (
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={!formData.state}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder={formData.state ? "City" : "Select a state/province first"}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {isSubmitting ? 'Saving...' : existingAddress ? 'Update Address' : 'Add Address'}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;

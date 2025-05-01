import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ClerkIntegration = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { cartItems, setCartItems } = useAppContext();

  // Function to sync user data with backend
  const syncUserWithBackend = async () => {
    try {
      if (!isSignedIn || !user) return;

      // Get token from Clerk
      const token = await getToken();

      // Prepare user data
      const userData = {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl
      };

      // Send data to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('User synced with backend:', data.user);
      } else {
        console.error('Failed to sync user with backend:', data.message);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  // Function to get cart data from backend
  const getCartFromBackend = async () => {
    try {
      if (!isSignedIn || !user) return;

      // Get token from Clerk
      const token = await getToken();
      localStorage.setItem('clerkToken', token); // Store token for later use

      // Get cart data from backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clerkId: user.id })
      });

      const data = await response.json();

      if (data.success) {
        // Update cart items in context
        setCartItems(data.cart);
        console.log('Cart synced with backend:', data.cart);
      } else {
        console.error('Failed to get cart from backend:', data.message);
      }
    } catch (error) {
      console.error('Error getting cart from backend:', error);
      toast.error('Failed to load your cart. Please try again.');
    }
  };

  // Sync user data when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserWithBackend();
      getCartFromBackend();
      console.log('User signed in, syncing data with backend');
    } else {
      // Clear clerk token when user signs out
      localStorage.removeItem('clerkToken');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  // Listen for cart changes and sync with backend
  useEffect(() => {
    if (isSignedIn && user && Object.keys(cartItems).length > 0) {
      // Only sync if user is signed in and cart has items
      const syncCart = async () => {
        try {
          const token = await getToken();
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

          // Convert cart format for backend
          const cartItemsArray = [];
          for (const productId in cartItems) {
            cartItemsArray.push({
              productId,
              quantity: cartItems[productId]
            });
          }

          await fetch(`${apiUrl}/cart/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              clerkId: user.id,
              cartItems: cartItemsArray
            })
          });

          console.log('Cart synced with backend on change');
        } catch (error) {
          console.error('Error syncing cart with backend:', error);
        }
      };

      // Debounce the sync to avoid too many requests
      const timeoutId = setTimeout(() => {
        syncCart();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [isSignedIn, user, cartItems, getToken]);

  // This component doesn't render anything
  return null;
};

export default ClerkIntegration;

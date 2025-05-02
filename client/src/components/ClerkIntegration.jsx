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

  // Function to get cart data from backend and merge with guest cart
  const getCartFromBackend = async () => {
    try {
      if (!isSignedIn || !user) return;

      // Get token from Clerk
      const token = await getToken();
      localStorage.setItem('clerkToken', token); // Store token for later use

      // Check if there's a guest cart to merge
      const guestCartString = localStorage.getItem('guestCart');
      const guestCart = guestCartString ? JSON.parse(guestCartString) : null;

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
      let userCart = {};

      if (data.success) {
        userCart = data.cart || {};
        console.log('Retrieved user cart from backend:', userCart);
      }

      // If there's a guest cart, merge it with the user's cart
      if (guestCart && Object.keys(guestCart).length > 0) {
        console.log('Found guest cart to merge:', guestCart);

        // Merge the carts - keep the higher quantity for each item
        const mergedCart = { ...userCart };

        for (const productId in guestCart) {
          if (!mergedCart[productId] || mergedCart[productId] < guestCart[productId]) {
            mergedCart[productId] = guestCart[productId];
          }
        }

        // Update cart items in context
        setCartItems(mergedCart);

        // Sync the merged cart with the backend
        // First, clear the existing cart
        await fetch(`${apiUrl}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ clerkId: user.id })
        });

        // Then add each item to the cart
        for (const productId in mergedCart) {
          await fetch(`${apiUrl}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              clerkId: user.id,
              productId,
              quantity: mergedCart[productId]
            })
          });
        }

        // Clear the guest cart after merging
        localStorage.removeItem('guestCart');
        console.log('Merged guest cart with user cart and synced with backend');

        if (Object.keys(guestCart).length > 0) {
          toast.success('Your cart items have been saved to your account');
        }
      } else {
        // No guest cart to merge, just use the user's cart from backend
        setCartItems(userCart);
        console.log('Using existing user cart from backend');
      }
    } catch (error) {
      console.error('Error getting/merging cart from backend:', error);
      toast.error('Failed to load your cart. Please try again.');
    }
  };

  // Sync user data when user signs in or out
  useEffect(() => {
    if (isSignedIn && user) {
      // User signed in - sync data with backend
      syncUserWithBackend();
      getCartFromBackend();
      console.log('User signed in, syncing data with backend');
    } else if (!isSignedIn) {
      // User signed out - clear clerk token and save current cart as guest cart
      localStorage.removeItem('clerkToken');

      // If there are items in the cart, save them to localStorage
      if (Object.keys(cartItems).length > 0) {
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
        console.log('User signed out, saved cart to localStorage');
      }
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

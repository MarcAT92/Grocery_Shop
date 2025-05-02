/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAdminLoggedIn, adminLogout } from "../utils/adminAuth";
import { useAuth, useUser } from '@clerk/clerk-react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(isAdminLoggedIn());
  const [products, setProducts] = useState([]);
  // Initialize cart items from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('guestCart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      console.log('Fetching products from API...');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`${apiUrl}/product/list?t=${timestamp}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // If we get an empty array from the API, that's valid
        const productCount = data.products ? data.products.length : 0;
        console.log(`Fetched ${productCount} products from API`);
        setProducts(data.products || []);
        return data.products || [];
      } else {
        console.error('Failed to fetch products:', data.message);
        toast.error('Failed to load products.');
        setProducts([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products. Please try again later.');
      setProducts([]);
      return [];
    }
  };

  // Admin logout function
  const handleAdminLogout = async () => {
    const success = await adminLogout();
    if (success) {
      setIsAdmin(false);
      navigate('/');
      toast.success("Logged out successfully");
    } else {
      toast.error("Logout failed");
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Function to sync a single cart item with backend
  const syncCartItemWithBackend = async (productId, quantity) => {
    try {
      if (!isSignedIn || !user) return;

      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      await fetch(`${apiUrl}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clerkId: user.id,
          productId,
          quantity
        })
      });

      console.log(`Synced cart item: ${productId}, quantity: ${quantity}`);
    } catch (error) {
      console.error('Error syncing cart item with backend:', error);
    }
  };

  // Function to remove a cart item from backend
  const removeCartItemFromBackend = async (productId) => {
    try {
      if (!isSignedIn || !user) return;

      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      await fetch(`${apiUrl}/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clerkId: user.id,
          productId
        })
      });

      console.log(`Removed cart item: ${productId}`);
    } catch (error) {
      console.error('Error removing cart item from backend:', error);
    }
  };

  // Add Product To Cart
  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);

    // Save to localStorage if user is not signed in
    if (!isSignedIn) {
      localStorage.setItem('guestCart', JSON.stringify(cartData));
    }

    toast.success("Added to cart");

    // Sync with backend if user is signed in
    if (isSignedIn && user) {
      try {
        await syncCartItemWithBackend(itemId, cartData[itemId]);
      } catch (error) {
        console.error('Error syncing cart with backend:', error);
      }
    }

    return true; // Return true to indicate the operation succeeded
  };

  // Update Cart Item Quantity
  const updateCartItem = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);

    // Save to localStorage if user is not signed in
    if (!isSignedIn) {
      localStorage.setItem('guestCart', JSON.stringify(cartData));
    }

    toast.success("Quantity updated");

    // Sync with backend if user is signed in
    if (isSignedIn && user) {
      try {
        await syncCartItemWithBackend(itemId, quantity);
      } catch (error) {
        console.error('Error syncing cart with backend:', error);
      }
    }

    return true; // Return true to indicate the operation succeeded
  };

  // Remove Product From Cart (decrements quantity)
  const removeFromCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    setCartItems(cartData);

    // Save to localStorage if user is not signed in
    if (!isSignedIn) {
      localStorage.setItem('guestCart', JSON.stringify(cartData));
    }

    toast.success("Removed from cart");

    // Sync with backend if user is signed in
    if (isSignedIn && user) {
      try {
        if (cartData[itemId]) {
          await syncCartItemWithBackend(itemId, cartData[itemId]);
        } else {
          await removeCartItemFromBackend(itemId);
        }
      } catch (error) {
        console.error('Error syncing cart with backend:', error);
      }
    }

    return true; // Return true to indicate the operation succeeded
  };

  // Delete Product From Cart (removes item completely regardless of quantity)
  const deleteFromCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);

      // Save to localStorage if user is not signed in
      if (!isSignedIn) {
        localStorage.setItem('guestCart', JSON.stringify(cartData));
      }

      toast.success("Product removed from cart");

      // Sync with backend if user is signed in
      if (isSignedIn && user) {
        try {
          await removeCartItemFromBackend(itemId);
        } catch (error) {
          console.error('Error syncing cart with backend:', error);
        }
      }
    }

    return true; // Return true to indicate the operation succeeded
  };

  // Get Total Cart Amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = products.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.offerPrice * cartItems[item];
        }
      }
    }
    return parseFloat(totalAmount.toFixed(2));
  };

  // Get Total Cart Item Count
  const getCartItemCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Save cart to localStorage when it changes (for non-signed-in users)
  useEffect(() => {
    if (!isSignedIn && Object.keys(cartItems).length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isSignedIn]);

  // Function to sync cart with backend
  const syncCartWithBackend = async (cartData, userId) => {
    try {
      if (!userId) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('clerkToken');

      // Convert cart format for backend
      const cartItems = [];
      for (const productId in cartData) {
        cartItems.push({
          productId,
          quantity: cartData[productId]
        });
      }

      // Send cart data to backend
      await fetch(`${apiUrl}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clerkId: userId,
          cartItems
        })
      });

    } catch (error) {
      console.error('Error syncing cart with backend:', error);
    }
  };

  const value = {
    navigate,
    isAdmin,
    setIsAdmin,
    products,
    currency,
    addToCart,
    deleteFromCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems,
    getTotalCartAmount,
    getCartItemCount,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    handleAdminLogout,
    syncCartWithBackend,
    fetchProducts
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};

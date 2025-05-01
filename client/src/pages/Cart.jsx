import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const Cart = () => {
    const { products, currency, cartItems, setCartItems, deleteFromCart, getCartItemCount, updateCartItem, navigate, getTotalCartAmount } = useAppContext();
    const [cartArray, setCartArray] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const { getToken, userId } = useAuth();
    const [paymentOptions, setPaymentOptions] = useState("Cash on Delivery");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Using useCallback to memoize the getCart function
    const getCart = useCallback(() => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key);
            if (product) {
                product.quantity = cartItems[key];
                tempArray.push(product);
            }
        }
        setCartArray(tempArray);
    }, [cartItems, products]);

    const placeOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please add a delivery address');
            navigate('/add-address');
            return;
        }

        try {
            const token = await getToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

            const response = await fetch(`${apiUrl}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clerkId: userId,
                    addressId: selectedAddress._id,
                    paymentMethod: paymentOptions
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Order placed successfully!');

                // Clear the cart
                setCartItems({});

                // Clear cart in backend
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
                    await fetch(`${apiUrl}/cart/clear`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ clerkId: userId })
                    });
                } catch (clearError) {
                    console.error('Error clearing cart in backend:', clearError);
                }

                // Navigate to order details page
                navigate(`/order/${data.order._id}`);
            } else {
                toast.error(data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Error placing order. Please try again.');
        }
    }

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDeleteDialog(true);
    }

    const confirmDelete = () => {
        if (productToDelete) {
            deleteFromCart(productToDelete);
        }
        setShowDeleteDialog(false);
        setProductToDelete(null);
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart();
            setIsLoading(false);
        }
    }, [products, cartItems, getCart])

    // Fetch default address when component mounts
    useEffect(() => {
        const fetchDefaultAddress = async () => {
            if (!userId) return;

            try {
                const token = await getToken();
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

                const response = await fetch(`${apiUrl}/address/default`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ clerkId: userId })
                });

                const data = await response.json();

                if (data.success) {
                    setSelectedAddress(data.address);
                } else {
                    // If no default address, prompt user to add one
                    console.log('No default address found');
                }
            } catch (error) {
                console.error('Error fetching default address:', error);
            }
        };

        fetchDefaultAddress();
    }, [userId, getToken])

    // Effect to handle body overflow when dialog is open
    useEffect(() => {
        if (showDeleteDialog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup function to reset overflow when component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showDeleteDialog]);

    if (isLoading) {
        return <Loader text="Loading your cart..." />;
    }

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16">
            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-gray-100 p-6 rounded-lg max-w-md w-full mx-4 shadow-xl border border-gray-300/70">
                        <h3 className="text-lg font-medium mb-4">Remove Item</h3>
                        <p className="mb-6">Are you sure you want to remove this item and all its quantities from your cart?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartItemCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0) }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className="flex items-center justify-center gap-1.5 md:gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none ml-2">
                                        <button
                                            onClick={() => updateCartItem(product._id, Math.max(1, cartItems[product._id] - 1))}
                                            className="cursor-pointer text-md px-1.5 md:px-2 h-full"
                                            disabled={cartItems[product._id] <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-5 text-center text-sm md:text-base">
                                            {cartItems[product._id]}
                                        </span>
                                        <button
                                            onClick={() => updateCartItem(product._id, cartItems[product._id] + 1)}
                                            className="cursor-pointer text-md px-1.5 md:px-2 h-full"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400">{currency}{product.offerPrice} / item</p>
                            <p>{currency}{product.offerPrice * product.quantity}</p>
                        </div>
                        <button
                            onClick={() => handleDeleteClick(product._id)}
                            className="cursor-pointer mx-auto"
                        >
                            <img src={assets.remove_icon} alt='remove' className='inline-block w-6 h-6' />
                        </button>
                    </div>
                ))}

                <button onClick={() => { navigate('/products'); scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} alt='arrow' className='group-hover:translate-x-1 transition' />
                    Continue Shopping
                </button>
            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        {selectedAddress ? (
                            <div className="text-gray-500">
                                <p className="font-medium">{selectedAddress.firstName} {selectedAddress.lastName}</p>
                                <p>{selectedAddress.addressLine1}</p>
                                {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                                <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                                <p className="text-xs mt-1 text-primary font-medium">Default Address</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No default address found</p>
                        )}
                        <button
                            onClick={() => {
                                localStorage.setItem('productDetailsLoading', 'true');
                                navigate('/add-address');
                            }}
                            className="text-primary hover:underline cursor-pointer"
                        >
                            {selectedAddress ? 'Change' : 'Add Address'}
                        </button>
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select
                        onChange={(e) => setPaymentOptions(e.target.value)}
                        className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
                        value={paymentOptions}
                    >
                        <option value="Cash on Delivery">Cash On Delivery</option>
                        <option value="Online Payment">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getTotalCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{parseFloat(getTotalCartAmount() * 0.02).toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>{currency}{(getTotalCartAmount() + getTotalCartAmount() * 0.02).toFixed(2)}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOptions === "Cash on Delivery" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart;
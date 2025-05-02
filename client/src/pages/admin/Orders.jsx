import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Orders = () => {
    const { currency } = useAppContext();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // State for error messages
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchOrders = useCallback(async () => {
        let timeoutId;

        setIsLoading(true);
        setError(null);

        try {
            // Set a timeout to reset loading state if it gets stuck
            timeoutId = setTimeout(() => {
                setIsLoading(false);
                setError('Loading orders timed out. Please try again.');
                toast.error('Loading orders timed out. Please try again.');
            }, 15000); // 15 seconds timeout
            // Add a minimum loading time of 500ms to prevent flickering
            const startTime = Date.now();

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('adminToken');

            if (!token) {
                setError('Authentication token not found. Please log in again.');
                toast.error('Authentication token not found. Please log in again.');
                setIsLoading(false);
                navigate('/admin/login');
                return;
            }

            console.log('Fetching orders with token:', token);
            const response = await fetch(`${apiUrl}/orders/admin/all`, {
                method: 'GET',
                headers: {
                    'Authorization': token, // Send token directly without Bearer prefix
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // Calculate elapsed time and wait if needed
            const elapsedTime = Date.now() - startTime;
            const minLoadingTime = 500; // 500ms minimum loading time

            if (elapsedTime < minLoadingTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
            }

            if (data.success) {
                setOrders(data.orders);
                setLastRefreshed(new Date());
            } else {
                setError(data.message || 'Failed to fetch orders');
                toast.error(data.message || 'Failed to fetch orders');

                // If unauthorized, redirect to login
                if (response.status === 401 || response.status === 403 || data.message?.includes('unauthorized') || data.message?.includes('token')) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('An error occurred while fetching orders');
            toast.error('An error occurred while fetching orders');

            // Check if it's an authentication error
            if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, [navigate]);

    // Handle refresh button click with useCallback for memoization
    const handleRefresh = useCallback(async () => {
        setIsLoading(true); // Show loader
        try {
            await fetchOrders();
            toast.success('Orders list refreshed');
        } catch (error) {
            console.error('Error refreshing orders:', error);
            toast.error('Failed to refresh orders');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Remove fetchOrders from dependencies to prevent infinite loop

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-6 p-4 space-y-4 max-w-6xl mx-auto">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-lg font-medium">Orders</h2>
                        {lastRefreshed && (
                            <p className="text-xs text-gray-500">
                                Updated {lastRefreshed.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-2 text-primary hover:bg-primary/5 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Refresh orders"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <Loader text="Loading orders..." />
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No orders found.</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.map((order, index) => (
                    <div
                        key={index}
                        className="p-5 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200
                        cursor-pointer"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}>
                        <div className="flex justify-between items-center mb-3 relative">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/5 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                                    {order.orderNumber || `#${order._id.substring(order._id.length - 6)}`}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                    {order.isPaid ? "Paid" : "Pending"}
                                </span>
                                <span className="font-medium text-sm">{currency}{(order.amount || order.totalPrice).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Order details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {/* Divider line */}
                            <div className="col-span-full h-px bg-gray-100 mb-3"></div>
                            {/* Customer info */}
                            <div className="flex flex-col">
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Customer</p>
                                <p className="text-sm">
                                    {order.shippingAddress?.firstName || 'N/A'} {order.shippingAddress?.lastName || ''}
                                </p>
                                {order.user && (
                                    <p className="text-xs text-gray-500 truncate">{order.user.email || 'No email'}</p>
                                )}
                            </div>

                            {/* Order items summary */}
                            <div className="flex flex-col">
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Order</p>
                                {order.orderItems && order.orderItems.length > 0 ? (
                                    <div>
                                        <p className="text-sm">
                                            {order.orderItems.reduce((total, item) => total + item.quantity, 0)} items
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            via {order.paymentMethod || 'N/A'}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No items</p>
                                )}
                            </div>

                            {/* Shipping address summary */}
                            <div className="flex flex-col">
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Shipping</p>
                                <p className="text-sm truncate">{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{order.status || 'Processing'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
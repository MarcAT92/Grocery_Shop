import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const { currency, navigate } = useAppContext();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);

    // Function to fetch order details
    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                localStorage.removeItem('adminToken'); // Clear any invalid token
                navigate('/admin/login');
                return;
            }

            // Basic token validation
            if (token.length < 10) {
                toast.error('Invalid authentication token. Please log in again.');
                localStorage.removeItem('adminToken'); // Clear the invalid token
                navigate('/admin/login');
                return;
            }

            // Use consistent token format with Bearer prefix
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            console.log('Fetching order details');
            const response = await fetch(`${apiUrl}/orders/admin/details/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': formattedToken,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
                setSelectedStatus(data.order.status);
                setIsPaid(data.order.isPaid);
            } else {
                toast.error(data.message || 'Failed to load order details');

                // If unauthorized, redirect to login
                if (response.status === 401 || response.status === 403 || data.message?.includes('unauthorized') || data.message?.includes('token')) {
                    // Special handling for credential updates
                    if (data.code === 'CREDENTIALS_UPDATED') {
                        toast.error('Your admin credentials have been updated. Please log in again with your new credentials.', {
                            duration: 8000, // Show for 8 seconds
                            position: 'top-center',
                            style: {
                                background: '#FF4B4B',
                                color: '#fff',
                                fontWeight: 'bold',
                                padding: '16px',
                                borderRadius: '10px',
                                fontSize: '16px',
                                maxWidth: '500px',
                            },
                            id: 'credentials-updated', // Prevent duplicate toasts
                        });

                        // Clear token
                        localStorage.removeItem('adminToken');

                        // Small delay to ensure toast is visible before refresh
                        setTimeout(() => {
                            console.log('Refreshing page after credential update');
                            window.location.href = '/admin/login'; // Force a full page refresh
                        }, 1500); // Longer delay to ensure the message is seen
                    } else {
                        localStorage.removeItem('adminToken');
                        navigate('/admin/login');
                    }
                } else {
                    navigate('/admin/orders');
                }
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error loading order details');

            // Check if it's an authentication error
            if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            } else {
                navigate('/admin/orders');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Function to update order status
    const updateOrderStatus = async () => {
        try {
            setIsUpdating(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                navigate('/admin/login');
                return;
            }

            // Use consistent token format with Bearer prefix
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            console.log('Updating order status');
            const response = await fetch(`${apiUrl}/orders/admin/update-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': formattedToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: id,
                    status: selectedStatus,
                    isPaid: isPaid
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Order status updated successfully');
                setOrder(data.order);
                setShowStatusDialog(false);
            } else {
                toast.error(data.message || 'Failed to update order status');

                // If unauthorized, redirect to login
                if (response.status === 401 || response.status === 403 || data.message?.includes('unauthorized') || data.message?.includes('token')) {
                    // Special handling for credential updates
                    if (data.code === 'CREDENTIALS_UPDATED') {
                        toast.error('Your admin credentials have been updated. Please log in again with your new credentials.', {
                            duration: 8000, // Show for 8 seconds
                            position: 'top-center',
                            style: {
                                background: '#FF4B4B',
                                color: '#fff',
                                fontWeight: 'bold',
                                padding: '16px',
                                borderRadius: '10px',
                                fontSize: '16px',
                                maxWidth: '500px',
                            },
                            id: 'credentials-updated', // Prevent duplicate toasts
                        });

                        // Clear token
                        localStorage.removeItem('adminToken');

                        // Small delay to ensure toast is visible before refresh
                        setTimeout(() => {
                            console.log('Refreshing page after credential update');
                            window.location.href = '/admin/login'; // Force a full page refresh
                        }, 1500); // Longer delay to ensure the message is seen
                    } else {
                        localStorage.removeItem('adminToken');
                        navigate('/admin/login');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');

            // Check if it's an authentication error
            if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // Fetch order details when component mounts
    useEffect(() => {
        fetchOrderDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (isLoading) {
        return (
            <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
                <div className="md:p-6 p-4 max-w-4xl mx-auto">
                    <div className="flex justify-center items-center py-8 mt-2">
                        <Loader text="Loading order details..." />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
                <div className="md:p-6 p-4 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-medium text-gray-700 mb-2">Order Not Found</h2>
                            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                        </div>
                        <Link
                            to="/admin/orders"
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="md:p-6 p-4 max-w-4xl mx-auto">
                {/* Status Update Dialog */}
                {showStatusDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-lg font-medium mb-4">Update Order Status</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    disabled={isUpdating}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {order.paymentMethod === 'Cash on Delivery' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-primary"
                                                name="paymentStatus"
                                                value="paid"
                                                checked={isPaid}
                                                onChange={() => setIsPaid(true)}
                                                disabled={isUpdating}
                                            />
                                            <span className="ml-2">Paid</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-primary"
                                                name="paymentStatus"
                                                value="pending"
                                                checked={!isPaid}
                                                onChange={() => setIsPaid(false)}
                                                disabled={isUpdating}
                                            />
                                            <span className="ml-2">Pending</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowStatusDialog(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateOrderStatus}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center min-w-[120px] cursor-pointer"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        'Update Status'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <Link to="/admin/orders" className="group cursor-pointer flex items-center gap-2 text-primary font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Orders
                    </Link>
                    <div>
                        <span className="text-gray-500">Order Number: </span>
                        <span className="font-medium">{order.orderNumber || `#${order._id.substring(order._id.length - 6)}`}</span>
                    </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-5 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-medium">Order Status</h2>
                            <p className={`mt-2 ${order.status === 'Delivered' ? 'text-green-600' :
                                order.status === 'Cancelled' ? 'text-red-600' :
                                    order.status === 'Shipped' ? 'text-blue-600' :
                                        'text-orange-500'
                                }`}>
                                {order.status}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Order Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-500 mt-2">Order Time</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowStatusDialog(true)}
                        className="mt-3 w-full py-2 cursor-pointer bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Update Order Status
                    </button>
                </div>

                {order.user && (
                    <div className="border border-gray-300 rounded-lg p-5 mb-6">
                        <h2 className="text-xl font-medium mb-4">Customer Information</h2>
                        <div className="text-gray-600">
                            <p><span className="font-medium">Name:</span> {order.user.name || 'N/A'}</p>
                            <p><span className="font-medium">Email:</span> {order.user.email || 'N/A'}</p>
                        </div>
                    </div>
                )}

                <div className="border border-gray-300 rounded-lg p-5 mb-6">
                    <h2 className="text-xl font-medium mb-4">Delivery Address</h2>
                    <div className="text-gray-600">
                        <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2">Phone: {order.shippingAddress.phoneNumber}</p>
                    </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-5 mb-6">
                    <h2 className="text-xl font-medium mb-4">Payment & Delivery Information</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium">{order.paymentMethod}</p>
                            <p className="text-gray-500 mt-3">Delivery Method</p>
                            <p className="font-medium">{order.deliveryMethod || 'Delivery'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Payment Status</p>
                            <p className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                            {order.isPaid && order.paidAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-5">
                    <h2 className="text-xl font-medium mb-4">Order Items</h2>

                    {order.orderItems.map((item, index) => (
                        <div key={index} className={`flex flex-col md:flex-row md:items-center justify-between py-4 ${index !== order.orderItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                            <div className="flex items-center mb-3 md:mb-0">
                                <div className="bg-gray-100 p-3 rounded-md">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover"
                                    />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                                    <p className="text-gray-500">{currency}{item.price.toFixed(2)} each</p>
                                </div>
                            </div>
                            <div className="text-right md:ml-4">
                                <p className="text-gray-500">Subtotal</p>
                                <p className="font-medium">{currency}{item.itemTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>{currency}{order.itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 mt-2">
                            <span>Tax</span>
                            <span>{currency}{order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 mt-2">
                            <span>Shipping</span>
                            <span>{currency}{(order.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-gray-200">
                            <span>Total</span>
                            <span>{currency}{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {order.status === 'Cancelled' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        <p className="font-medium">This order has been cancelled.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrderDetails;

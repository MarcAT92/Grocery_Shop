import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const OrderDetails = () => {
    const { id } = useParams();
    const { currency, navigate } = useAppContext();
    const { isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    // Function to fetch order details
    const fetchOrderDetails = async () => {
        if (!isSignedIn || !user) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

            const response = await fetch(`${apiUrl}/orders/details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: id,
                    clerkId: user.id
                })
            });

            const data = await response.json();

            if (data.success) {
                setOrder(data.order);

                // Calculate time left for cancellation
                if (data.order.canCancel) {
                    const orderTime = new Date(data.order.createdAt).getTime();
                    const currentTime = new Date().getTime();
                    const oneHourInMs = 60 * 60 * 1000;
                    const timeLeftMs = oneHourInMs - (currentTime - orderTime);
                    setTimeLeft(Math.max(0, Math.floor(timeLeftMs / 1000))); // in seconds
                }
            } else {
                toast.error(data.message || 'Failed to load order details');
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error loading order details');
            navigate('/my-orders');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to cancel order
    const cancelOrder = async () => {
        if (!isSignedIn || !user || !order) return;

        try {
            setIsCancelling(true);
            const token = await getToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

            const response = await fetch(`${apiUrl}/orders/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: id,
                    clerkId: user.id
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Order cancelled and removed successfully');
                setShowCancelDialog(false);
                // Navigate back to my orders page since the order has been removed
                navigate('/my-orders');
            } else {
                toast.error(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Error cancelling order');
        } finally {
            setIsCancelling(false);
        }
    };

    // Format time left as mm:ss
    const formatTimeLeft = (seconds) => {
        if (seconds === null) return '';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Update time left every second
    useEffect(() => {
        if (timeLeft === null) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Fetch order details when component mounts and scroll to top
    useEffect(() => {
        // Scroll to the top of the page when component mounts
        window.scrollTo(0, 0);

        if (isSignedIn && user) {
            fetchOrderDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, user, id]);

    if (isLoading) {
        return <Loader text="Loading order details..." />;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-medium text-gray-700 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                </div>
                <Link
                    to="/my-orders"
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to My Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-16 pb-16 max-w-4xl mx-auto">
            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-medium mb-4">Cancel Order</h3>
                        <p className="mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCancelDialog(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={isCancelling}
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={cancelOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                disabled={isCancelling}
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <Link to="/my-orders" className="group cursor-pointer flex items-center gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} alt='arrow' className='group-hover:translate-x-1 transition' />
                    Back to My Orders
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
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.status}
                            </span>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                {order.isPaid ? 'Paid' : 'Payment Pending'}
                            </span>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-500 font-medium">Payment Details</p>
                            <div className="flex flex-col mt-1">
                                <div className="flex items-center">
                                    <span className="text-gray-600 mr-2">Payment:</span>
                                    <span className="font-medium">{order.paymentMethod}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <span className="text-gray-600 mr-2">Fulfillment:</span>
                                    <span className="font-medium">{order.deliveryMethod || 'Delivery'}</span>
                                </div>
                                {order.isPaid && order.paidAt && (
                                    <div className="flex items-center mt-1">
                                        <span className="text-gray-600 mr-2">Paid on:</span>
                                        <span className="font-medium">{new Date(order.paidAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500">Order Date</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-500 mt-2">Order Time</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                </div>

                {order.status !== 'Cancelled' && order.canCancel && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-yellow-800 font-medium">Cancellation Window</p>
                                <p className="text-sm text-yellow-700">
                                    You can cancel this order within 1 hour of placing it.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-yellow-700">Time remaining:</p>
                                <p className="font-mono font-medium text-yellow-800">{formatTimeLeft(timeLeft)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCancelDialog(true)}
                            className="mt-3 w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            disabled={timeLeft === 0}
                        >
                            Cancel Order
                        </button>
                    </div>
                )}

                {order.status !== 'Cancelled' && order.status !== 'Delivered' && !order.canCancel && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-700">
                            The cancellation window for this order has expired. If you need to cancel this order, please contact customer support.
                        </p>
                    </div>
                )}

                {order.status === 'Delivered' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700">
                            This order has been delivered successfully. Thank you for shopping with us!
                        </p>
                    </div>
                )}
            </div>

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
                        <span>{currency}{order.shippingPrice || '0.00'}</span>
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
                    <p className="text-sm mt-1">If you have any questions, please contact customer support.</p>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;

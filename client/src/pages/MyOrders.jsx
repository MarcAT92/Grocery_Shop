import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currency, navigate } = useAppContext();
    const { isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const location = useLocation();

    const fetchMyOrders = async () => {
        setIsLoading(true);
        try {
            if (!isSignedIn || !user) {
                // If user is not signed in, show empty state
                setMyOrders([]);
                return;
            }

            const token = await getToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

            const response = await fetch(`${apiUrl}/orders/myorders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ clerkId: user.id })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Orders fetched successfully:', data.orders);
                setMyOrders(data.orders);
            } else {
                console.error('Failed to fetch orders:', data.message);
                toast.error('Failed to load your orders');
                setMyOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error loading your orders');
            setMyOrders([]);
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch orders when component mounts or when user navigates back from order details
    useEffect(() => {
        if (isSignedIn && user) {
            fetchMyOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, user, location.key])

    return (
        <div className='mt-16 pb-16 max-w-4xl mx-auto'>
            <div className='flex flex-col w-full sm:w-max items-center sm:items-start mb-8'>
                <p className='text-2xl font-medium uppercase'>My Orders</p>
                <div className='w-16 h-0.5 ml-16 bg-primary rounded-full'></div>
            </div>

            {isLoading ? (
                <Loader text="Loading your orders..." />
            ) : myOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-700 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to place your first order!</p>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Start Shopping
                    </button>
                </div>
            ) : myOrders.map((order, index) => (
                <div
                    key={index}
                    className='border border-gray-300 rounded-lg mb-8 p-5 max-w-4xl cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => navigate(`/order/${order._id}`)}
                >
                    <div className='flex flex-col md:flex-row md:items-center justify-between mb-3'>
                        <div className='flex items-center'>
                            <div className='bg-primary/10 p-3 rounded-lg mr-4'>
                                <img
                                    src={order.orderItems && order.orderItems[0] ? order.orderItems[0].image : '/placeholder.png'}
                                    alt='product'
                                    className='w-12 h-12 object-cover'
                                />
                            </div>
                            <div>
                                <p className='text-gray-800 font-medium'>Order {order.orderNumber || `#${order._id.substring(order._id.length - 6)}`}</p>
                                <p className='text-gray-500 text-sm'>{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className='flex flex-col md:items-end mt-3 md:mt-0'>
                            <p className='text-primary font-medium'>{currency}{(order.amount || order.totalPrice).toFixed(2)}</p>
                            <div className='flex flex-wrap gap-1 mt-1 justify-end'>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status || 'Processing'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {order.isPaid ? 'Paid' : 'Payment Pending'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800`}>
                                    {order.deliveryMethod || 'Delivery'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-between items-center mt-3 pt-3 border-t border-gray-200'>
                        <p className='text-gray-500 text-sm'>{(order.orderItems || order.items).length} {(order.orderItems || order.items).length === 1 ? 'item' : 'items'}</p>
                        <div className='flex items-center text-primary'>
                            <span className='mr-1'>View Details</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MyOrders
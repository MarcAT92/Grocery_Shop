import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets, dummyOrders } from '../../assets/assets';
import Loader from '../../components/Loader';

const Orders = () => {
    const { currency } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setOrders(dummyOrders);
            setIsLoading(false);
        }, 1000);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>

                {isLoading ? (
                    <Loader text="Loading orders..." />
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No orders found.</p>
                    </div>
                ) : orders.map((order, index) => (
                    <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300">
                        <div className="flex gap-5 max-w-80">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <p className="font-medium">
                                            {item.product.name}{" "} <span className='text-primary'>x {item.quantity}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm md:text-base text-black-60">
                            <p className='text-black/80'>{order.address.firstName} {order.address.lastName}</p>
                            <p>{order.address.street}, {order.address.city}</p>
                            <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                            <p></p>
                            <p>{order.address.phone}</p>
                        </div>

                        <p className="font-medium text-lg my-auto">{currency}{order.amount}</p>

                        <div className="flex flex-col text-sm md:text-base text-black/60">
                            <p>Payment Method: {order.paymentType}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
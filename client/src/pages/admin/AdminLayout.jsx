import React, { useEffect, useCallback, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, NavLink, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAdminData } from '../../utils/adminAuth';


const AdminLayout = () => {
    const { handleAdminLogout, navigate } = useAppContext();
    const [adminName, setAdminName] = useState('Admin');

    // Get admin name from localStorage on component mount
    useEffect(() => {
        const adminData = getAdminData();
        if (adminData && adminData.name) {
            setAdminName(adminData.name);
        }
    }, []);

    // Function to validate token with server (using useCallback to avoid dependency issues)
    const validateTokenWithServer = useCallback(async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            const response = await fetch(`${apiUrl}/admin/validate-token`, {
                method: 'GET',
                headers: {
                    'Authorization': formattedToken,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.admin && data.admin.name) {
                // Update admin name if it's available in the response
                setAdminName(data.admin.name);

                // Update stored admin data
                const adminData = getAdminData() || {};
                localStorage.setItem('adminData', JSON.stringify({
                    ...adminData,
                    name: data.admin.name,
                    email: data.admin.email,
                    id: data.admin.id
                }));
            }

            if (!data.success) {
                console.warn('Token validation failed:', data.message, data);

                // Handle credential update specifically
                if (data.code === 'CREDENTIALS_UPDATED') {
                    // Use a more prominent notification for credential updates
                    toast.error(
                        'Your admin credentials have been updated. Please log in again with your new credentials.',
                        {
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
                        }
                    );

                    // Clear token
                    console.log('Clearing admin token due to credential update');
                    localStorage.removeItem('adminToken');

                    // Small delay to ensure toast is visible before refresh
                    setTimeout(() => {
                        console.log('Refreshing page after credential update');
                        window.location.href = '/admin/login'; // Force a full page refresh
                    }, 1500); // Longer delay to ensure the message is seen
                } else {
                    // Generic authentication error
                    toast.error('Authentication error. Please log in again.');

                    // Clear token and redirect
                    console.log('Clearing admin token and redirecting to login page');
                    localStorage.removeItem('adminToken');

                    // Small delay to ensure toast is visible before redirect
                    setTimeout(() => {
                        navigate('/admin/login');
                    }, 300);
                }

                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating token with server:', error);
            return true; // Don't log out on network errors
        }
    }, [navigate]);

    // Check for valid admin token on mount and periodically
    useEffect(() => {
        // Function to validate token locally
        const validateTokenLocally = () => {
            const token = localStorage.getItem('adminToken');

            // Check if token exists
            if (!token) {
                console.warn('No admin token found, redirecting to login');
                navigate('/admin/login');
                return false;
            }

            // Basic validation
            if (token.length < 10) {
                console.warn('Admin token appears invalid (too short), redirecting to login');
                localStorage.removeItem('adminToken'); // Clean up invalid token
                navigate('/admin/login');
                return false;
            }

            return true;
        };

        // Initial local validation
        if (!validateTokenLocally()) return;

        console.log('Admin token validated locally on layout mount');

        // Initial server validation
        validateTokenWithServer();

        // Set up periodic validation (every 5 seconds)
        const intervalId = setInterval(() => {
            console.log('Performing periodic token validation check');
            if (validateTokenLocally()) {
                validateTokenWithServer();
            }
        }, 5000); // 5 seconds

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [navigate, validateTokenWithServer]);

    const sidebarLinks = [
        { name: "Add Product", path: "/admin", icon: assets.add_icon },
        { name: "Product List", path: "/admin/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/admin/orders", icon: assets.order_icon },
    ];

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to="/admin">
                    <img src={assets.logo} alt="logo" className="cursor-pointer w-43 md:w-38" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! <span className="font-medium text-primary">{adminName}</span></p>
                    <button onClick={handleAdminLogout} className='border rounded-full text-sm px-4 py-1 cursor-pointer hover:bg-primary-dull hover:text-white transition'>Logout</button>
                </div>
            </div>
            <div className='flex'>
                <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col ">
                    {sidebarLinks.map((item) => (
                        <NavLink to={item.path} key={item.name} end={item.path === "/admin" ? true : false}
                            activeClassName="border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                            className={({ isActive }) => `flex items-center py-3 px-4 gap-3
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                    : "hover:bg-gray-100/90 border-white"
                                }`
                            }
                        >
                            <img src={item.icon} alt="icon" className="w-7  h-7" />
                            <p className="md:block hidden text-center">{item.name}</p>
                        </NavLink>
                    ))}
                </div>
                <Outlet />
            </div>
        </>
    );
};

export default AdminLayout;
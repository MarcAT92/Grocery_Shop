import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, NavLink, Outlet } from 'react-router-dom';


const AdminLayout = () => {
    const { handleAdminLogout, navigate } = useAppContext();

    // Check for valid admin token on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

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
                    <p>Hi! Admin</p>
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
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const { isAdmin, setIsAdmin } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Call backend API for admin login
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Include cookies in the request
            });

            const data = await response.json();

            if (data.success) {
                // Store token in localStorage for future requests
                try {
                    // Log the token for debugging
                    console.log('Received token:', data.token);

                    // Store token in localStorage
                    localStorage.setItem('adminToken', data.token);

                    // Store admin data in localStorage
                    localStorage.setItem('adminData', JSON.stringify({
                        id: data.admin._id,
                        name: data.admin.name,
                        email: data.admin.email
                    }));

                    // Verify the token was stored correctly
                    const storedToken = localStorage.getItem('adminToken');
                    console.log('Stored token:', storedToken);

                    if (storedToken && storedToken === data.token) {
                        console.log('Admin token stored successfully');

                        // Verify token format by checking for lastUpdated field
                        try {
                            // Decode the token (just the payload part)
                            const tokenParts = storedToken.split('.');
                            if (tokenParts.length === 3) {
                                const payload = JSON.parse(atob(tokenParts[1]));
                                console.log('Token payload verified:', payload.id ? 'Valid' : 'Invalid');

                                if (!payload.lastUpdated) {
                                    console.warn('Token missing lastUpdated field - may be using old format');
                                }
                            }
                        } catch (e) {
                            console.warn('Could not decode token for verification:', e);
                        }

                        setIsAdmin(true);
                        // Navigation is handled by the useEffect below
                    } else {
                        console.error('Token storage verification failed');
                        setError('Failed to store authentication token. Please try again.');
                    }
                } catch (storageError) {
                    console.error('Error storing token:', storageError);
                    setError('Failed to store authentication token. Please try again.');
                }
            } else {
                setError(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login. Please try again.');
        }

        setIsLoading(false);
    }

    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true }); // Navigate to /admin when isAdmin becomes true
        }
    }, [isAdmin, navigate]);

    // Removed redundant useEffect that navigated to /admin/dashboard

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8'>
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-[0_2px_40px_-4px_rgba(0,0,0,0.05)] z-10 transition-all duration-300 hover:shadow-[0_2px_40px_-4px_rgba(0,0,0,0.09)]">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome to <span className='text-primary'>GroceryShop</span>
                    </h2>
                    <h3 className='text-2xl font-bold text-gray-900 tracking-tight'>Admin <span className='text-primary'>Login</span></h3>
                    <p className="text-base text-gray-600">
                        Sign in to manage your store
                    </p>
                </div>
                <form onSubmit={onSubmitHandler} className='mt-10 space-y-6'>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-900 text-base placeholder:text-gray-400"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="relative group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={`block w-full px-4 py-3 rounded-xl border ${isPasswordFocused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'} transition-all duration-200 text-gray-900 text-base placeholder:text-gray-400`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-dull focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </div>
                            ) : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
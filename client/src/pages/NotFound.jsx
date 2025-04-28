import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const NotFound = () => {
    const { navigate } = useAppContext();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Shopping Cart Animation */}
                <div className="mt-12 flex justify-center">
                    <div className="w-16 h-16 relative animate-bounce">
                        <svg
                            className="text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4.78571 5H18.2251C19.5903 5 20.5542 6.33739 20.1225 7.63246L18.4558 12.6325C18.1836 13.4491 17.4193 14 16.5585 14H6.07142M4.78571 5L4.74531 4.71716C4.60455 3.73186 3.76071 3 2.76541 3H2M4.78571 5L6.07142 14M6.07142 14L6.25469 15.2828C6.39545 16.2681 7.23929 17 8.23459 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-bold text-primary tracking-tight">404</h1>
                    <h2 className="text-3xl font-semibold text-gray-900">Page Not Found</h2>
                    <p className="text-gray-600 text-lg">
                        Oops! The page you're looking for seems to have wandered off to do some shopping.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dull transition-all duration-300 transform hover:scale-105"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
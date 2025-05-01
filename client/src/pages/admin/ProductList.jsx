import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { assets } from '../../assets/assets';
import Loader from '../../components/Loader';

// Separate component for the empty state
const EmptyProductState = () => (
    <div className="flex flex-col justify-center items-center h-60 w-full">
        <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        </div>
        <p className="text-gray-500 text-lg mb-2">No products found</p>
        <p className="text-gray-400 text-center max-w-md">Add your first product by using the Add Product page. Products you add will appear here.</p>
    </div>
);

// Separate component for the stock toggle switch
const StockToggle = ({ isInStock, isLoading, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
        <input
            type="checkbox"
            className="sr-only peer"
            checked={isInStock}
            onChange={onChange}
            disabled={isLoading}
        />
        <div className={`w-12 h-7 ${isInStock ? 'bg-blue-600' : 'bg-slate-300'} rounded-full peer transition-colors duration-200`}></div>
        <span className={`dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${isInStock ? 'translate-x-5' : ''}`}></span>
    </label>
);

// Separate component for the refresh button
const RefreshButton = ({ onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
        <img src={assets.refresh_icon} alt="refresh" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Refreshing...' : 'Refresh'}
    </button>
);

// Separate component for the product table
const ProductTable = ({ products, currency, onToggleStock, loadingStates }) => {
    // Ensure products is an array to prevent mapping errors
    const safeProducts = Array.isArray(products) ? products : [];

    // Define a placeholder image URL
    const placeholderImage = 'https://via.placeholder.com/150?text=No+Image';

    return (
        <div className="flex flex-col items-center w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full table-auto">
                    <thead className="bg-gray-50 text-gray-900 text-sm text-left">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Product</th>
                            <th className="px-4 py-3 font-semibold">Category</th>
                            <th className="px-4 py-3 font-semibold hidden md:table-cell">Regular Price</th>
                            <th className="px-4 py-3 font-semibold hidden md:table-cell">Offer Price</th>
                            <th className="px-4 py-3 font-semibold">In Stock</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-500 divide-y divide-gray-200">
                        {safeProducts.map((product) => {
                            // Safely access product properties
                            const productId = product?._id || 'unknown';
                            const productName = product?.name || 'Unnamed Product';
                            const productCategory = product?.category || 'Uncategorized';
                            const productPrice = product?.price || 0;
                            const productOfferPrice = product?.offerPrice || 0;
                            const productInStock = !!product?.inStock;
                            const productImage = product?.image && Array.isArray(product.image) && product.image.length > 0
                                ? product.image[0]
                                : placeholderImage;

                            return (
                                <tr key={productId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 border border-gray-300 rounded p-1 w-16 h-16 flex items-center justify-center">
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    className="w-14 h-14 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = placeholderImage;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                                                <p className="text-xs text-gray-500 truncate md:hidden">Category: {productCategory}</p>
                                                <p className="text-xs text-gray-500 truncate md:hidden">
                                                    Price: {currency}{productPrice} / {currency}{productOfferPrice}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">{productCategory}</td>
                                    <td className="px-4 py-4 hidden md:table-cell">{currency}{productPrice}</td>
                                    <td className="px-4 py-4 hidden md:table-cell">{currency}{productOfferPrice}</td>
                                    <td className="px-4 py-4">
                                        <StockToggle
                                            isInStock={productInStock}
                                            isLoading={loadingStates[productId]}
                                            onChange={() => onToggleStock(productId, !productInStock)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductList = () => {
    const { products, currency, fetchProducts } = useAppContext();
    const [loadingStates, setLoadingStates] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [error, setError] = useState(null);
    const [productList, setProductList] = useState([]);

    // Function to load products with useCallback for memoization
    const loadProducts = useCallback(async () => {
        let timeoutId;

        try {
            setError(null);
            setIsLoading(true);

            // Set a timeout to reset loading state if it gets stuck
            timeoutId = setTimeout(() => {
                setIsLoading(false);
                setError('Loading products timed out. Please try again.');
                toast.error('Loading products timed out. Please try again.');
            }, 15000); // 15 seconds timeout

            // Add a minimum loading time of 500ms to prevent flickering
            const startTime = Date.now();
            const result = await fetchProducts();

            // Calculate how much time has passed
            const elapsedTime = Date.now() - startTime;
            const minLoadingTime = 500; // 500ms minimum loading time

            // If less than minLoadingTime has passed, wait the remaining time
            if (elapsedTime < minLoadingTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
            }

            return result; // Return success status
        } catch (error) {
            console.error('Error loading products:', error);
            setError('Failed to load products. Please try again.');
            toast.error('Failed to load products');
            return false; // Return failure status
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Remove fetchProducts from dependencies to prevent infinite loop

    // Safely update product list when products change
    useEffect(() => {
        if (Array.isArray(products)) {
            setProductList(products);
        }
    }, [products]);

    // Fetch products on component mount
    useEffect(() => {
        // Only load products once on mount
        loadProducts();

        // Cleanup function
        return () => {
            // Any cleanup needed when component unmounts
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Empty dependency array to run only on mount

    // Handle stock toggle with useCallback for memoization
    const handleStockToggle = useCallback(async (productId, inStock) => {
        if (!productId || productId === 'unknown') return;

        // Prevent multiple clicks by checking if already loading
        if (loadingStates[productId]) return;

        // Set loading state for this product
        setLoadingStates(prev => ({ ...prev, [productId]: true }));

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                setLoadingStates(prev => ({ ...prev, [productId]: false }));
                return;
            }

            // Add a minimum loading time of 300ms to prevent flickering
            const startTime = Date.now();

            const response = await fetch(`${apiUrl}/product/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: productId, inStock })
            });

            const data = await response.json();

            // Calculate elapsed time and wait if needed
            const elapsedTime = Date.now() - startTime;
            const minLoadingTime = 300; // 300ms minimum loading time

            if (elapsedTime < minLoadingTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
            }

            if (data.success) {
                toast.success(`Product ${inStock ? 'in stock' : 'out of stock'}`);
                // Update the product list without showing the full page loader
                await fetchProducts();
            } else {
                toast.error(data.message || 'Failed to update stock status');
            }
        } catch (error) {
            console.error('Error updating stock status:', error);
            toast.error('An error occurred while updating stock status');
        } finally {
            // Clear loading state for this product
            setLoadingStates(prev => ({ ...prev, [productId]: false }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Remove dependencies to prevent infinite loop

    // Handle refresh button click with useCallback for memoization
    const handleRefresh = useCallback(async () => {
        setIsLoading(true); // Show loader
        try {
            await loadProducts();
            toast.success('Product list refreshed');
        } catch (error) {
            console.error('Error refreshing products:', error);
            toast.error('Failed to refresh products');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Remove loadProducts from dependencies to prevent infinite loop



    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <div className="flex justify-between items-center pb-4">
                    <h2 className="text-lg font-medium">All Products</h2>
                    <RefreshButton onClick={handleRefresh} isLoading={isLoading} />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader text="Loading products..." />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg mb-2">Error Loading Products</p>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !productList || productList.length === 0 ? (
                    <EmptyProductState />
                ) : (
                    <ProductTable
                        products={productList}
                        currency={currency}
                        onToggleStock={handleStockToggle}
                        loadingStates={loadingStates}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductList;
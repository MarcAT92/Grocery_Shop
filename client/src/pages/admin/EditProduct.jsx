import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../../assets/assets';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import Loader from '../../components/Loader';

const EditProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchProducts } = useAppContext();

    // Get product ID from URL params
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get('id');

    const [files, setFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [inStock, setInStock] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [keepExistingImages, setKeepExistingImages] = useState(true);

    // Parse description array into string format for textarea
    const formatDescription = (descArray) => {
        if (!descArray || !Array.isArray(descArray)) return '';
        return descArray.join('\n');
    };

    // Parse description string into array format for API
    const parseDescription = (text) => {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim() !== '');
    };

    // Fetch product data
    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId) {
                toast.error('Product ID is missing');
                navigate('/admin/product-list');
                return;
            }

            setIsLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
                const response = await fetch(`${apiUrl}/product/id`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: productId })
                });

                const data = await response.json();

                if (data.success) {
                    const product = data.product;
                    setName(product.name);
                    setDescription(formatDescription(product.description));
                    setCategory(product.category);
                    setPrice(product.price.toString());
                    setOfferPrice(product.offerPrice.toString());
                    setInStock(product.inStock);
                    setExistingImages(product.image || []);
                } else {
                    toast.error(data.message || 'Failed to fetch product details');
                    navigate('/admin/product-list');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Error loading product details');
                navigate('/admin/product-list');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [productId, navigate]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // Validate form
        if (!name || !description || !category || !price || !offerPrice) {
            toast.error('Please fill all required fields');
            return;
        }

        if (parseFloat(offerPrice) > parseFloat(price)) {
            toast.error('Offer price cannot be greater than regular price');
            return;
        }

        if (!keepExistingImages && files.length === 0 && existingImages.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setIsSaving(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                return;
            }

            // Create form data
            const formData = new FormData();

            // Add product data
            const productData = {
                id: productId, // Ensure product ID is included
                name,
                description: parseDescription(description),
                category,
                price: parseFloat(parseFloat(price).toFixed(2)),
                offerPrice: parseFloat(parseFloat(offerPrice).toFixed(2)),
                inStock,
                keepExistingImages
            };

            // Log the product ID to verify it's being included
            console.log('Updating product with ID:', productId);

            formData.append('productData', JSON.stringify(productData));

            // Also add the ID directly to the form data as a fallback
            formData.append('id', productId);

            // Add new image files if any
            files.forEach(file => {
                if (file) {
                    formData.append('images', file);
                }
            });

            // Log the form data for debugging
            console.log('Form data entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Send request to API
            const response = await fetch(`${apiUrl}/product/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Product updated successfully');
                // Refresh product list
                fetchProducts();
                // Navigate back to product list
                navigate('/admin/product-list');
            } else {
                toast.error(data.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);

            if (error.name === 'SyntaxError') {
                toast.error('Invalid response from server. Please try again.');
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                toast.error('Network error. Please check your connection and try again.');
            } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
                toast.error('Authentication error. Please log in again.');
            } else {
                toast.error('An error occurred while updating the product. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveExistingImage = (index) => {
        const updatedImages = [...existingImages];
        updatedImages.splice(index, 1);
        setExistingImages(updatedImages);
    };

    if (isLoading) {
        return (
            <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
                <div className="flex justify-between items-center md:px-10 px-4 pt-4 pb-4">
                    <h2 className="text-lg font-medium">Edit Product</h2>
                </div>
                <div className="md:px-10 md:pb-10 p-4 flex justify-center items-center min-h-[60vh]">
                    <Loader text="Loading product details..." />
                </div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="flex justify-between items-center md:px-10 px-4 pt-4 pb-4">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/admin/product-list')}
                        className="mr-3 p-2 text-primary hover:bg-primary/5 rounded-full flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-medium">Edit Product</h2>
                </div>
            </div>

            {isSaving ? (
                <div className="md:px-10 md:pb-10 p-4 flex justify-center items-center min-h-[60vh]">
                    <Loader text="Updating product..." />
                </div>
            ) : (
                <form onSubmit={onSubmitHandler} className="md:px-10 md:pb-10 p-4 space-y-5 max-w-lg">
                    <div>
                        <p className="text-base font-medium">Product Images</p>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="mt-2 mb-4">
                                <div className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id="keepImages"
                                        checked={keepExistingImages}
                                        onChange={(e) => setKeepExistingImages(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="keepImages" className="text-sm">Keep existing images</label>
                                </div>

                                <p className="text-sm text-gray-500 mb-2">Current Images:</p>
                                <div className="flex flex-wrap gap-3">
                                    {existingImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Product ${index}`}
                                                className="w-24 h-24 object-cover border rounded"
                                            />
                                            {!keepExistingImages && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        <p className="text-sm text-gray-500 mt-3 mb-2">Add New Images:</p>
                        <div className="flex flex-wrap items-center gap-3">
                            {Array(4).fill('').map((_, index) => (
                                <label key={index} htmlFor={`image${index}`}>
                                    <input
                                        onChange={(e) => {
                                            const updatedFiles = [...files];
                                            updatedFiles[index] = e.target.files[0];
                                            setFiles(updatedFiles);
                                        }}
                                        accept="image/*"
                                        type="file"
                                        id={`image${index}`}
                                        hidden
                                    />
                                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                        {files[index] ? (
                                            <img
                                                src={URL.createObjectURL(files[index])}
                                                alt={`Upload ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            id="product-name"
                            type="text"
                            placeholder="Type here"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                        <textarea
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            id="product-description"
                            rows={4}
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                            placeholder="Type here"
                        ></textarea>
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="category">Category</label>
                        <select
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            id="category"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        >
                            <option value="">Select Category</option>
                            {categories.map((item, index) => (
                                <option key={index} value={item.path}>{item.path}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex-1 flex flex-col gap-1 w-32">
                            <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
                            <input
                                onChange={(e) => setPrice(e.target.value)}
                                value={price}
                                id="product-price"
                                type="number"
                                placeholder="0"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                required
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1 w-32">
                            <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                            <input
                                onChange={(e) => setOfferPrice(e.target.value)}
                                value={offerPrice}
                                id="offer-price"
                                type="number"
                                placeholder="0"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="inStock"
                            checked={inStock}
                            onChange={(e) => setInStock(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="inStock" className="text-base font-medium">In Stock</label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/product-list')}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded cursor-pointer hover:bg-gray-50"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer hover:bg-primary-dark"
                        >
                            UPDATE PRODUCT
                        </button>
                    </div>
                </form>
            )}


        </div>
    );
};

export default EditProduct;

import React, { useState } from 'react';
import { assets, categories } from '../../assets/assets';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import Loader from '../../components/Loader';

const AddProducts = () => {
    const { fetchProducts } = useAppContext();
    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Parse description into array format
    const parseDescription = (text) => {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim() !== '');
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // Validate form
        if (!name || !description || !category || !price || !offerPrice) {
            toast.error('Please fill all required fields');
            return;
        }

        if (files.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        if (parseFloat(offerPrice) > parseFloat(price)) {
            toast.error('Offer price cannot be greater than regular price');
            return;
        }

        setIsLoading(true);

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
                name,
                description: parseDescription(description),
                category,
                price: parseFloat(price),
                offerPrice: parseFloat(offerPrice),
                inStock: true
            };

            formData.append('productData', JSON.stringify(productData));

            // Add image files
            files.forEach(file => {
                if (file) {
                    formData.append('images', file);
                }
            });

            // Log the form data for debugging
            console.log('Sending product data:', productData);
            console.log('Number of images:', files.filter(Boolean).length);

            // Send request to API
            const response = await fetch(`${apiUrl}/product/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log('API response:', data);

            if (data.success) {
                toast.success('Product added successfully');
                // Reset form
                setFiles([]);
                setName('');
                setDescription('');
                setCategory('');
                setPrice('');
                setOfferPrice('');
                // Refresh product list
                fetchProducts();
            } else {
                // Handle specific error messages
                if (data.error && data.error.includes('cloudinary')) {
                    toast.error('Image upload failed. Cloudinary configuration may be missing.');
                } else {
                    toast.error(data.message || 'Failed to add product');
                }
            }
        } catch (error) {
            console.error('Error adding product:', error);

            // Provide more specific error messages
            if (error.name === 'SyntaxError') {
                toast.error('Invalid response from server. Please try again.');
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                toast.error('Network error. Please check your connection and try again.');
            } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
                toast.error('Authentication error. Please log in again.');
            } else {
                toast.error('An error occurred while adding the product. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll fle flex-col justify-between">
            <div className="flex justify-between items-center md:px-10 px-4 pt-4 pb-4">
                <h2 className="text-lg font-medium">Add New Product</h2>
            </div>

            {isLoading ? (
                <div className="md:px-10 md:pb-10 p-4 flex justify-center items-center min-h-[60vh]">
                    <Loader text="Adding product..." />
                </div>
            ) : (
                <form onSubmit={onSubmitHandler} className="md:px-10 md:pb-10 p-4 space-y-5 max-w-lg">
                    <div>
                        <p className="text-base font-medium">Product Image</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {Array(4).fill('').map((_, index) => (
                                <label key={index} htmlFor={`image${index}`}>
                                    <input onChange={(e) => {
                                        const updatedFiles = [...files];
                                        updatedFiles[index] = e.target.files[0];
                                        setFiles(updatedFiles);
                                    }} accept="image/*" type="file" id={`image${index}`} hidden />
                                    <img className="max-w-24 cursor-pointer" src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt="uploadArea" width={100} height={100} />
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                        <input onChange={(e) => setName(e.target.value)} value={name} id="product-name" type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                        <textarea onChange={(e) => setDescription(e.target.value)} value={description} id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="category">Category</label>
                        <select onChange={(e) => setCategory(e.target.value)} value={category} id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40">
                            <option value="">Select Category</option>
                            {categories.map((item, index) => (
                                <option key={index} value={item.path}>{item.path}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex-1 flex flex-col gap-1 w-32">
                            <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
                            <input onChange={(e) => setPrice(e.target.value)} value={price} id="product-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                        </div>
                        <div className="flex-1 flex flex-col gap-1 w-32">
                            <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                            <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} id="offer-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer"
                    >
                        ADD PRODUCT
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddProducts;
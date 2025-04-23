import React from 'react'
import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';

const AllProduct = () => {
    const {
        products,
        searchQuery,
        selectedCategory,
        setSelectedCategory,
        categories
    } = useAppContext();

    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        let filtered = products;

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category === selectedCategory
            );
        }

        // Apply search filter
        if (searchQuery && searchQuery.length > 0) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className='mt-16 px-4 sm:px-6 lg:px-8'> {/* Added consistent horizontal padding */}
            <div className='max-w-7xl mx-auto'> {/* Centered container with max width */}
                <div className='flex flex-col'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4'>
                        {/* All Products Title */}
                        <div className='flex flex-col w-full sm:w-max items-center sm:items-start'>
                            <p className='text-2xl font-medium uppercase'>All Products</p>
                            <div className='w-16 h-0.5 ml-26 bg-primary rounded-full'></div>
                        </div>

                        {/* Category Filter */}
                        <div className='flex justify-center sm:justify-start w-full sm:w-auto'>
                            <div className='flex items-center gap-4'>
                                <span className='text-gray-600'>Category:</span>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className='border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-primary'
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                        {filteredProducts
                            .filter((product) => product.inStock)
                            .map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProduct;
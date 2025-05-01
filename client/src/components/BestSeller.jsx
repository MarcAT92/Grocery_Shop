import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
    const { products } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [bestSellerProducts, setBestSellerProducts] = useState([]);

    useEffect(() => {
        if (products && products.length > 0) {
            // Filter and slice products once they're available
            const filtered = products.filter(product => product.inStock).slice(0, 5);
            setBestSellerProducts(filtered);
            setIsLoading(false);
        }
    }, [products]);

    return (
        <div className='mt-16'>
            <p className='text-2xl md:text-3xl font-medium'>Best Sellers</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                {
                    bestSellerProducts.map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))
                }
            </div>
        </div>
    )
}

export default BestSeller
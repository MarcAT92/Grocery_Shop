import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams, Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';


const ProductDetails = () => {

    const { products, navigate, currency, addToCart, removeFromCart, cartItems } = useAppContext();
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [isLoading, setIsLoading] = useState(() => {
        // Check if we're coming from a navigation (localStorage has the loading flag)
        const isNavigating = localStorage.getItem('productDetailsLoading') === 'true';
        return isNavigating || true; // Default to true for initial load
    });

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        // Clear the loading flag from localStorage
        localStorage.removeItem('productDetailsLoading');

        // Set loading state
        setIsLoading(true);

        // Add a minimum loading time for better UX
        const minLoadingTime = setTimeout(() => {
            if (products.length > 0) {
                // If we have products but no matching product, still set loading to false
                if (!product) {
                    setIsLoading(false);
                    return;
                }

                // If we have the product, get related products
                let productsCopy = products.slice();
                productsCopy = productsCopy.filter((item) => product.category === item.category)
                setRelatedProducts(productsCopy.slice(0, 5));
                setIsLoading(false);
            }
        }, 800); // Minimum loading time of 800ms for better UX

        return () => clearTimeout(minLoadingTime);
    }, [products, product]);

    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null);
    }, [product])

    // Show loader while loading
    if (isLoading) {
        return <Loader text="Loading product details..." />;
    }

    // If product is not found after loading
    if (!product) {
        return (
            <div className="mt-12 min-h-[60vh] flex flex-col items-center justify-center">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-medium text-gray-700 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                </div>
                <Link
                    to="/products"
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <p>
                <Link to={"/"} onClick={() => localStorage.setItem('productDetailsLoading', 'true')}>Home</Link> /
                <Link to={"/products"} onClick={() => localStorage.setItem('productDetailsLoading', 'true')}>Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`} onClick={() => localStorage.setItem('productDetailsLoading', 'true')}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                            <img src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt='rating-star' className='md:w-4 w-3.5' />
                        ))}
                        <p className="text-base ml-2">(4)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.price.toFixed(2)}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice.toFixed(2)}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        {!cartItems[product?._id] ? (
                            <button
                                onClick={() => addToCart(product._id)}
                                className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 md:gap-2 w-full h-[50px] bg-primary/25 rounded select-none">
                                <button
                                    onClick={() => removeFromCart(product._id)}
                                    className="cursor-pointer text-xl px-4 h-full"
                                >
                                    -
                                </button>
                                <span className="w-5 text-center text-lg md:text-xl">{cartItems[product._id]}</span>
                                <button
                                    onClick={() => addToCart(product._id)}
                                    className="cursor-pointer text-xl px-4 h-full"
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                addToCart(product._id);
                                localStorage.setItem('productDetailsLoading', 'true');
                                navigate("/cart");
                            }}
                            className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
            {/* ---------- related product  ---------- */}
            <div className='flex flex-col items-center mt-20'>
                <div className='flex flex-col items-center w-max'>
                    <p className='text-3xl font-medium'>Related Products</p>
                    <div className='w-20 h-0.5 bg-primary rounded-full mt-2'></div>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                    {relatedProducts.filter((product) => product.inStock).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>
                <button
                    onClick={() => {
                        localStorage.setItem('productDetailsLoading', 'true');
                        navigate('/products');
                        scrollTo(0, 0);
                    }}
                    className='mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition'
                >
                    View More
                </button>
            </div>
        </div >
    );
};

export default ProductDetails;
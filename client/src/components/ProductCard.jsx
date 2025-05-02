import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems } = useAppContext();
    const navigate = useNavigate();

    // Create the product URL
    const productUrl = `/products/${product.category.toLowerCase()}/${product._id}`;

    // Preload the product details component on hover
    const handleMouseEnter = () => {
        // This will trigger the dynamic import in the background
        import('../pages/ProductDetails');
    };

    // Navigate to product details
    const handleCardClick = (e) => {
        // Don't navigate if the click was on a button or the cart controls
        if (e.target.closest('.cart-controls')) {
            return;
        }
        // Set loading state in localStorage before navigation
        localStorage.setItem('productDetailsLoading', 'true');
        navigate(productUrl);
        scrollTo(0, 0);
    };

    return product && (
        <div
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            className="border border-primary-dull rounded-md md:px-4 px-3 py-2 bg-gray-100/50 transition-all duration-200 hover:shadow-md cursor-pointer" >
            <div className="group cursor-pointer flex items-center justify-center px-2">
                <img className="group-hover:scale-105 transition max-w-26 md:max-w-36" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm space-y-1 md:space-y-1.5">
                <p>{product.category}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                <div className="flex items-center gap-1">
                    {Array(5).fill('').map((_, i) => (
                        <img key={i} className="md:w-3.5 w-3" src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" />
                    ))}
                    <p>(4)</p>
                </div>
                <div className="flex items-end justify-between mt-2 md:mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{product.offerPrice.toFixed(2)}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price.toFixed(2)}</span>
                    </p>
                    <div className="text-primary cart-controls">
                        {!cartItems[product._id] ? (
                            <button
                                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product._id);
                                }}
                            >
                                <img src={assets.cart_icon} alt="cart icon" className="w-4 h-4" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 md:gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(product._id);
                                    }}
                                    className="cursor-pointer text-md px-1.5 md:px-2 h-full"
                                >
                                    -
                                </button>
                                <span className="w-5 text-center text-sm md:text-base">{cartItems[product._id]}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product._id);
                                    }}
                                    className="cursor-pointer text-md px-1.5 md:px-2 h-full"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
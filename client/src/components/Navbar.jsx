import React, { memo, useCallback, useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import PropTypes from 'prop-types'
import ErrorBoundary from './ErrorBoundary'



const CartButton = memo(({ navigate, cartCount }) => {
    const handleCartClick = useCallback((e) => {
        e.preventDefault()
        navigate('/cart')
    }, [navigate])

    return (
        <div
            onClick={handleCartClick}
            className="relative cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Shopping cart"
        >
            <img src={assets.nav_cart_icon} alt="cart" className='w-8 opacity-80' />
            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
            </span>
        </div>
    )
})

CartButton.propTypes = {
    navigate: PropTypes.func.isRequired,
    cartCount: PropTypes.number.isRequired
}

CartButton.displayName = 'CartButton'

const DesktopMenu = memo(({ navigate, cartCount }) => (
    <div className="hidden sm:flex items-center gap-3 md:gap-4 lg:gap-6">
        <NavLink to='/products' className="whitespace-nowrap" aria-label="All Products">All Products</NavLink>
        <SignedIn>
            <NavLink to='/my-orders' className="whitespace-nowrap" aria-label="My Orders">My Orders</NavLink>
        </SignedIn>
        <NavLink to='/contact' className="whitespace-nowrap" aria-label="Contact">Contact</NavLink>

        <CartButton navigate={navigate} cartCount={cartCount} />

        <SignedOut>
            <div className='flex items-center gap-4'>
                <SignInButton mode="modal">
                    <button
                        className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
                        aria-label="Login"
                    >
                        Sign in
                    </button>
                </SignInButton>
            </div>
        </SignedOut>

        <SignedIn>
            <UserButton signOutUrl='/' />
        </SignedIn>
    </div>
))

DesktopMenu.propTypes = {
    navigate: PropTypes.func.isRequired,
    cartCount: PropTypes.number.isRequired
}

DesktopMenu.displayName = 'DesktopMenu'

const MobileMenu = memo(({ open, setOpen, menuRef }) => {
    const handleClose = useCallback(() => setOpen(false), [setOpen])

    return open ? (
        <div
            ref={menuRef}
            className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-4 px-5 text-sm md:hidden z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
        >
            <NavLink
                to='/products'
                onClick={handleClose}
                className="w-full hover:text-primary transition-colors"
            >
                All Products
            </NavLink>
            <SignedIn>
                <NavLink
                    to='/my-orders'
                    onClick={handleClose}
                    className="w-full hover:text-primary transition-colors"
                >
                    My Orders
                </NavLink>
            </SignedIn>
            <NavLink
                to='/contact'
                onClick={handleClose}
                className="w-full hover:text-primary transition-colors"
            >
                Contact
            </NavLink>

            <SignedOut>
                <div className='flex flex-col gap-2 w-full mt-2'>
                    <SignInButton mode="modal">
                        <button
                            onClick={handleClose}
                            className="w-full px-6 py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm font-medium"
                        >
                            Sign in
                        </button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                <div className="w-full">
                    <UserButton signOutUrl='/' />
                </div>
            </SignedIn>
        </div>
    ) : null
})

MobileMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    menuRef: PropTypes.object.isRequired
    // Removed navigate and cartCount as they are not directly used or passed down further
}

MobileMenu.displayName = 'MobileMenu'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const { navigate, getCartItemCount } = useAppContext()
    const cartCount = getCartItemCount()
    const menuRef = useRef(null)
    const menuButtonRef = useRef(null)

    const toggleMenu = useCallback(() => {
        setOpen(prev => !prev)
    }, [])

    // Handle clicks outside the menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Only run this if the menu is open
            if (!open) return;

            // Close the menu if the click is outside both the menu and the menu button
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        // Add event listener when the menu is open
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [open])

    return (
        <ErrorBoundary>
            <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
                <NavLink to='/' onClick={() => setOpen(false)}>
                    <img className="h-9" src={assets.logo} alt="Company logo" />
                </NavLink>

                <DesktopMenu navigate={navigate} cartCount={cartCount} />

                {/* Mobile Icons: Cart and Menu Toggle */}
                <div className="sm:hidden flex items-center gap-5"> {/* Reduced gap */}
                    <CartButton navigate={navigate} cartCount={cartCount} />
                    <button
                        ref={menuButtonRef}
                        onClick={toggleMenu}
                        aria-label={open ? "Close menu" : "Open menu"}
                        className="p-1" /* Added padding for easier clicking */
                    >
                        <img src={assets.menu_icon} alt={open ? "Close menu" : "Open menu"} className="w-6 h-6" /> {/* Explicit size */}
                    </button>
                </div>

                <MobileMenu open={open} setOpen={setOpen} menuRef={menuRef} />
            </nav>
        </ErrorBoundary>
    )
}

export default memo(Navbar)
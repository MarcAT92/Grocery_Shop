import React, { memo, useCallback, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import PropTypes from 'prop-types'
import ErrorBoundary from './ErrorBoundary'

const SearchBar = memo(() => {
    const { searchQuery, setSearchQuery } = useAppContext()

    const handleSearch = useCallback((e) => {
        const sanitizedValue = e.target.value.replace(/[<>]/g, '')
        setSearchQuery(sanitizedValue)
    }, [setSearchQuery])

    return (
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input 
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                type="search"
                placeholder="Search products"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search products"
            />
            <img src={assets.search_icon} alt="search" className='w-4 h-4' />
        </div>
    )
})

SearchBar.displayName = 'SearchBar'

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
    <div className="hidden sm:flex items-center gap-8">
        <NavLink to='/' aria-label="Home">Home</NavLink>
        <NavLink to='/products' aria-label="All Products">All Products</NavLink>
        <SignedIn>
            <NavLink to='/my-orders' aria-label="My Orders">My Orders</NavLink>
        </SignedIn>
        <NavLink to='/contact' aria-label="Contact">Contact</NavLink>
        <SearchBar />
        <CartButton navigate={navigate} cartCount={cartCount} />
        
        <SignedOut>
            <div className='flex items-center gap-4'>
                <SignInButton mode="modal">
                    <button 
                        className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
                        aria-label="Login"
                    >
                        Login
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

const MobileMenu = memo(({ open, setOpen }) => {
    const handleClose = useCallback(() => setOpen(false), [setOpen])

    return open ? (
        <div 
            className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-4 px-5 text-sm md:hidden z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
        >
            <NavLink 
                to='/' 
                onClick={handleClose}
                className="w-full hover:text-primary transition-colors"
            >
                Home
            </NavLink>
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
                            Login
                        </button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                <UserButton 
                    signOutUrl='/'
                >
                    <button 
                        onClick={handleClose} 
                        className="w-full px-6 py-2.5 mt-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-sm font-medium"
                    >
                        Logout
                    </button>
                </UserButton>
            </SignedIn>
        </div>
    ) : null
})

MobileMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    cartCount: PropTypes.number.isRequired
}

MobileMenu.displayName = 'MobileMenu'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const { navigate, cartItems } = useAppContext()
    const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0)

    const toggleMenu = useCallback(() => {
        setOpen(prev => !prev)
    }, [])

    return (
        <ErrorBoundary>
            <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
                <NavLink to='/' onClick={() => setOpen(false)}>
                    <img className="h-9" src={assets.logo} alt="Company logo" />
                </NavLink>

                <DesktopMenu navigate={navigate} cartCount={cartCount} />

                <button 
                    onClick={toggleMenu} 
                    aria-label={open ? "Close menu" : "Open menu"} 
                    className="sm:hidden"
                >
                    <img src={assets.menu_icon} alt={open ? "Close menu" : "Open menu"} />
                </button>

                <MobileMenu open={open} setOpen={setOpen} cartCount={cartCount} />
            </nav>
        </ErrorBoundary>
    )
}

export default memo(Navbar)
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function Navbar() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart) || [];
  const toggleCart = useCartStore((state) => state.toggleCart);
  const user = useCartStore((state) => state.user);
  const location = useLocation();

  const totalItems = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogoClick = (e) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (cleanQuery) {
      navigate(`/shop?search=${encodeURIComponent(cleanQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 z-50 bg-[#F9F9F8] border-b border-neutral-200 w-full select-none">
      <div className="w-full px-6 sm:px-8 h-20 flex items-center justify-between relative z-50 bg-[#F9F9F8]">
        
        {/* Mobile Menu Trigger Button */}
        <button 
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            setIsSearchOpen(false);
          }} 
          className="md:hidden text-neutral-900 p-2 cursor-pointer focus:outline-none" 
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="text-2xl font-black tracking-widest text-neutral-900 z-50 cursor-pointer"
        >
          AURA
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs tracking-widest uppercase font-medium text-neutral-800">
          <Link to="/new-arrivals" className="hover:text-neutral-500 transition-colors">New Arrivals</Link>
          <Link to="/shop?category=Women" className="hover:text-neutral-500 transition-colors">Women</Link>
          <Link to="/shop?category=Men" className="hover:text-neutral-500 transition-colors">Men</Link>
          <Link to="/shop" className="hover:text-neutral-500 transition-colors">Collections</Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-neutral-900 z-50">
          <button 
            type="button"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsMobileMenuOpen(false);
            }} 
            aria-label="Toggle Search" 
            className="p-2 cursor-pointer hover:opacity-60 transition-opacity"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop User Icon: ?tab=profile query ke sath taake active tab hamesha profile par reset ho */}
          <Link 
            to={user ? "/profile?tab=profile" : "/login"}
            aria-label="Account" 
            className="p-2 hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center cursor-pointer"
          >
            <User className="w-5 h-5" />
          </Link>

          <button 
            type="button"
            onClick={toggleCart} 
            aria-label="Cart" 
            className="p-2 cursor-pointer hover:opacity-60 transition-opacity relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Expandable Search Bar Drawer */}
      {isSearchOpen && (
  <div className="absolute top-20 inset-x-0 bg-white border-b border-neutral-200 px-6 sm:px-8 py-6 shadow-md z-40">
    <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center space-x-4">
      <Search className="w-5 h-5 text-neutral-400 shrink-0" />
      
      {/* Screen-reader aur accessibility ke liye label */}
      <label htmlFor="site-search" className="sr-only">Search Catalog</label>
      
      <input 
        id="site-search"
        name="site-search"
        type="search" 
        autoComplete="off"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="SEARCH PRODUCTS, CATEGORIES..." 
        className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none uppercase tracking-wider"
        autoFocus
      />
      <button type="submit" className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 shrink-0 cursor-pointer flex items-center justify-center">
        Search
      </button>
      <button type="button" onClick={() => setIsSearchOpen(false)} className="text-neutral-500 hover:text-neutral-900 p-1 cursor-pointer">
        <X className="w-5 h-5" />
      </button>
    </form>
  </div>
)}

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 inset-x-0 bg-[#F9F9F8] border-b border-neutral-200 px-6 py-8 shadow-xl z-45 space-y-6">
          <nav className="flex flex-col space-y-4 text-xs tracking-widest uppercase font-medium text-neutral-900">
            <Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 transition-colors py-2 border-b border-neutral-200">New Arrivals</Link>
            <Link to="/shop?category=Women" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 transition-colors py-2 border-b border-neutral-200">Women</Link>
            <Link to="/shop?category=Men" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 transition-colors py-2 border-b border-neutral-200">Men</Link>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 transition-colors py-2 border-b border-neutral-200">Collections</Link>
            <Link to={user ? "/profile?tab=profile" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 transition-colors py-2">
              {user ? 'My Profile' : 'Sign In / Account'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function Navbar() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart) || [];
  const toggleCart = useCartStore((state) => state.toggleCart);
  const user = useCartStore((state) => state.user);
  const setUser = useCartStore((state) => state.setUser);
  const showToast = useCartStore((state) => state.showToast);
  const location = useLocation();

  const totalItems = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isShopActive = location.pathname === '/shop' && (!location.search || location.search === '?category=All');
  const isNewArrivalsActive = location.pathname === '/new-arrivals';
  const isWomenActive = location.pathname === '/shop' && location.search.toLowerCase().includes('category=women');
  const isMenActive = location.pathname === '/shop' && location.search.toLowerCase().includes('category=men');
  const isLookbookActive = location.pathname === '/lookbook';

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

  const handleShopClick = (e) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    if (location.pathname === '/shop' && !location.search) {
      if (e) e.preventDefault();
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

  const handleMobileLogout = () => {
    setIsMobileMenuOpen(false);
    setUser(null);
    showToast('Logged out successfully.');
    navigate('/login');
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
        <nav className="hidden md:flex items-center space-x-7 lg:space-x-8 text-xs tracking-widest uppercase font-medium text-neutral-800">
          <Link 
            to="/new-arrivals" 
            className={`transition-colors ${isNewArrivalsActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-500'}`}
          >
            New Arrivals
          </Link>
          <Link 
            to="/shop" 
            onClick={handleShopClick} 
            className={`transition-colors ${isShopActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-500'}`}
          >
            Shop
          </Link>
          <Link 
            to="/shop?category=Men" 
            className={`transition-colors ${isMenActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-500'}`}
          >
            Men
          </Link>
          <Link 
            to="/shop?category=Women" 
            className={`transition-colors ${isWomenActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-500'}`}
          >
            Women
          </Link>
          <Link 
            to="/lookbook" 
            className={`transition-colors ${isLookbookActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-500'}`}
          >
            Lookbook
          </Link>
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
            <Link 
              to="/shop" 
              onClick={handleShopClick} 
              className={`py-2 border-b border-neutral-200 transition-colors ${isShopActive ? 'font-bold text-neutral-900' : 'hover:text-neutral-500'}`}
            >
              Shop
            </Link>
            <Link 
              to="/new-arrivals" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`py-2 border-b border-neutral-200 transition-colors ${isNewArrivalsActive ? 'font-bold text-neutral-900' : 'hover:text-neutral-500'}`}
            >
              New Arrivals
            </Link>
            <Link 
              to="/shop?category=Women" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`py-2 border-b border-neutral-200 transition-colors ${isWomenActive ? 'font-bold text-neutral-900' : 'hover:text-neutral-500'}`}
            >
              Women
            </Link>
            <Link 
              to="/shop?category=Men" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`py-2 border-b border-neutral-200 transition-colors ${isMenActive ? 'font-bold text-neutral-900' : 'hover:text-neutral-500'}`}
            >
              Men
            </Link>
            <Link 
              to="/lookbook" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`py-2 border-b border-neutral-200 transition-colors ${isLookbookActive ? 'font-bold text-neutral-900' : 'hover:text-neutral-500'}`}
            >
              Lookbook
            </Link>
          </nav>

          {/* Mobile Auth Buttons */}
          {user ? (
            <div className="pt-2 border-t border-neutral-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1 text-xs text-neutral-600">
                <User className="w-3.5 h-3.5 text-neutral-900" />
                <span className="truncate font-medium text-neutral-900">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.email || 'My Account')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/profile?tab=profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 bg-neutral-900 text-white text-[11px] uppercase tracking-widest font-bold text-center rounded-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>My Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="py-2.5 px-3 border border-neutral-300 text-neutral-700 text-[11px] uppercase tracking-widest font-bold text-center rounded-xs hover:border-neutral-900 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 bg-neutral-900 text-white text-xs uppercase tracking-widest font-bold text-center rounded-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 border border-neutral-900 bg-transparent text-neutral-900 text-xs uppercase tracking-widest font-bold text-center rounded-xs hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
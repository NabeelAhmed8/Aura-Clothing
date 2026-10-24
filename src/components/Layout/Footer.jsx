import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useCartStore((state) => state.showToast);
  const location = useLocation();

  // Agar already usi page par ho toh smooth scroll to top kare
  const handleScrollToTop = (e, targetPath) => {
    if (location.pathname === targetPath) {
      e.preventDefault(); // Default router behavior roko taake scroll smoothly chale
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      // Fallback for full cross-browser compatibility
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Subscribed successfully');
        setEmail('');
      } else {
        showToast(data.message || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      showToast('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-neutral-900 text-white border-t border-neutral-800 mt-auto pb-[env(safe-area-inset-bottom,0px)]">
      <div className="w-full px-6 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="space-y-4">
          <Link 
            to="/" 
            onClick={(e) => handleScrollToTop(e, '/')} 
            className="text-xl font-black tracking-widest block"
          >
            AURA
          </Link>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            Aura is an independent luxury label focused on minimal design, sustainable materials, and timeless wardrobe staples.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white">Shop</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-light">
            <li>
              <Link to="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link>
            </li>
            <li>
              <Link to="/shop?category=Women" className="hover:text-white transition-colors">Women's Outerwear</Link>
            </li>
            <li>
              <Link to="/shop?category=Men" className="hover:text-white transition-colors">Men's Knitwear</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white">About</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-light">
            <li>
              <Link 
                to="/our-story" 
                onClick={(e) => handleScrollToTop(e, '/our-story')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                to="/sustainability"
                onClick={(e) => handleScrollToTop(e, '/sustainability')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Sustainability
              </Link>
            </li>
            <li>
  <Link 
    to="/contact" 
    onClick={(e) => handleScrollToTop(e, '/contact')}
    className="hover:text-white transition-colors cursor-pointer"
  >
    Contact Us
  </Link>
</li>
          </ul>
        </div>

        <div className="space-y-4">
  <h4 className="text-xs uppercase tracking-widest font-bold text-white">Connect</h4>
  <p className="text-xs text-neutral-400 font-light">
    Subscribe to receive private sale updates and early collection access.
  </p>
  <form onSubmit={handleSubscribe} className="space-y-2 py-2">
    <label htmlFor="newsletter-email" className="sr-only">
      Email Address for Newsletter
    </label>
    <input 
      id="newsletter-email"
      name="newsletter-email"
      autoComplete="email"
      type="email" 
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email" 
      required
      disabled={isSubmitting}
      className="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white disabled:opacity-60 disabled:cursor-not-allowed"
    />
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full py-3 sm:py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center text-center ${
        isSubmitting
          ? 'bg-neutral-300 text-neutral-700 cursor-not-allowed'
          : 'bg-white text-neutral-900 hover:bg-neutral-200 cursor-pointer'
      }`}
    >
      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
    </button>
  </form>
</div>

      </div>

      <div className="w-full px-6 sm:px-8 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest">
        <p>&copy; 2026 AURA | Independent Luxury Studio. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link 
            to="/privacy-policy" 
            onClick={(e) => handleScrollToTop(e, '/privacy-policy')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms-of-service" 
            onClick={(e) => handleScrollToTop(e, '/terms-of-service')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useCartStore } from './store/useCartStore';

// Layouts & Global Components
import MainLayout from './components/Layout/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Layout/Navbar';
import CartDrawer from './components/Layout/CartDrawer';
import QuickViewDrawer from './components/Layout/QuickViewDrawer';
import Toast from './components/Layout/Toast';
import BackToHomeButton from './components/Layout/BackToHomeButton';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LookbookPage from './pages/LookbookPage';
import OurStory from './pages/OurStory';
import Sustainability from './pages/Sustainability';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import NewArrivals from './pages/NewArrivals';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  // Desktop aur Mobile device sync fix
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'aura-cart-storage' || !e.key) {
        if (useCartStore?.persist?.rehydrate) {
          useCartStore.persist.rehydrate();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <HashRouter>
      {/* Scroll fix on route change */}
      <ScrollToTop />

      {/* Global Navigation & Overlays */}
      <Navbar />
      <CartDrawer />
      <QuickViewDrawer />
      <Toast />

      {/* Main Page Content (pt-20 navbar offset ke liye, flex-1 to prevent bottom white space) */}
      <main className="pt-20 flex-1 flex flex-col w-full bg-[#171717]">
        <Routes>
          {/* Main Layout Pages with unified Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/lookbook" element={<LookbookPage />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Route>

          {/* Standalone Auth & Dashboard Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </main>

      {/* Floating Back-To-Home Button */}
      <BackToHomeButton />
    </HashRouter>
  );
}

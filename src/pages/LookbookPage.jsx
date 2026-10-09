import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useQuickViewStore } from '../store/useQuickViewStore';
import { Eye } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Footer from '../components/Layout/Footer';

export default function LookbookPage() {
  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);

  const [outfits, setOutfits] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Page header ko target karne ke liye ref
  const lookbookHeaderRef = useRef(null);

  // Jab bhi tab (category) change ho, page smooth tarike se uper Lookbook title par scroll ho
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [activeTab]);

  const fetchOutfits = () => {
    fetch(`${API_BASE_URL}/api/products`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedOutfits = data.map((item) => ({
            ...item,
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.image,
            description: item.description || 'Tailored essentials crafted for modern wardrobe.',
            stock: typeof item.stock === 'number' ? item.stock : (typeof item.countInStock === 'number' ? item.countInStock : 15),
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : (item.stock === undefined || item.stock > 0),
          }));

          setOutfits(formattedOutfits);
          const initialQtys = {};
          formattedOutfits.forEach((item) => {
            initialQtys[item.id] = 1;
          });
          setQuantities(initialQtys);
        } else {
          setOutfits([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch outfits from backend:', err);
        setOutfits([]);
        setError('Server is offline or unavailable. Outfits cannot be loaded.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const updated = current + delta;
      return { ...prev, [id]: updated < 1 ? 1 : updated };
    });
  };

  const handleAddToCart = (outfit) => {
    const qty = quantities[outfit.id] || 1;
    addToCart(outfit, qty);
  };

  const filteredOutfits = activeTab === 'All' 
    ? outfits 
    : outfits.filter(item => item.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="-mt-4 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div ref={lookbookHeaderRef} className="text-center max-w-2xl mx-auto mb-14 space-y-3 scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Editorial 2026</span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900">THE LOOKBOOK</h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Discover curated summer edits live-fetched from men and women collections.
          </p>
        </div>

        {/* Category Tabs */}
        <div role="tablist" aria-label="Lookbook categories" className="flex justify-center items-center gap-6 sm:space-x-8 mb-12 text-xs uppercase tracking-widest font-medium">
          {['All', 'Women', 'Men'].map((tab) => {
            const isActive = activeTab.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`pb-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold -mb-px' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-2.5 rounded-sm border border-neutral-200">
                <div className="aspect-4/5 bg-neutral-200 rounded-xs mb-3" />
                <div className="h-2.5 bg-neutral-200 rounded-xs w-1/3 mb-2" />
                <div className="h-3 bg-neutral-200 rounded-xs w-3/4 mb-2" />
                <div className="h-3 bg-neutral-200 rounded-xs w-1/4 mb-4" />
                <div className="h-9 bg-neutral-100 rounded-xs" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-14 px-6 bg-white border border-neutral-200 rounded-xs max-w-md mx-auto my-8 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
              Offline
            </span>
            <p className="text-xs font-semibold text-neutral-800">
              {error}
            </p>
            <p className="text-[11px] text-neutral-500">
              Backend server connect nahi ho raha. Server start karein aur retry karein.
            </p>
            <button
              type="button"
              onClick={fetchOutfits}
              className="mt-2 px-4 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
            No outfits found.
          </div>
        ) : (
          /* 6-Column Compact Grid */
          <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
            {filteredOutfits.map((outfit) => {
              const currentQty = quantities[outfit.id] || 1;

              return (
                <div 
                  key={outfit.id} 
                  className="group flex flex-col bg-white p-2.5 rounded-sm border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-xs text-left"
                >
                  {/* Compact Product Image */}
                  <div 
                    onClick={() => openQuickView(outfit)}
                    className="relative aspect-4/5 bg-neutral-100 overflow-hidden rounded-xs cursor-pointer group/img"
                  >
                    <img 
                      src={outfit.image} 
                      alt={outfit.name} 
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                      {outfit.category}
                    </div>

                    {/* Quick View Hover Button */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                      <span className="bg-white/95 text-neutral-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-xs shadow-md flex items-center gap-1.5 hover:bg-neutral-900 hover:text-white transition-colors">
                        <Eye className="w-3 h-3" />
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-2.5 flex flex-col flex-1 justify-between space-y-1.5">
                    <div>
                      <h3 
                        onClick={() => openQuickView(outfit)}
                        className="text-xs font-medium text-neutral-900 line-clamp-2 leading-snug min-h-8 cursor-pointer hover:underline"
                      >
                        {outfit.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-light mt-0.5 line-clamp-1">
                        {outfit.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 pt-0.5">
                      ${outfit.price}
                    </span>
                  </div>

                  {/* Controls: Compact Quantity Stepper & Add to Cart */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between border border-neutral-200 rounded-xs bg-neutral-50 h-9 sm:h-10">
                      <button 
                        type="button" 
                        aria-label={`Decrease quantity for ${outfit.name}`}
                        onClick={() => handleQuantityChange(outfit.id, -1)}
                        className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-xs font-semibold text-neutral-900">
                        {currentQty}
                      </span>
                      <button 
                        type="button" 
                        aria-label={`Increase quantity for ${outfit.name}`}
                        onClick={() => handleQuantityChange(outfit.id, 1)}
                        className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleAddToCart(outfit)} 
                      className="w-full bg-neutral-900 text-white h-9 sm:h-10 py-2.5 px-4 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer rounded-xs flex items-center justify-center text-center"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
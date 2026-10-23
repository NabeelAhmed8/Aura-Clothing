import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useQuickViewStore } from '../store/useQuickViewStore';
import { Eye, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Footer from '../components/Layout/Footer';
import LazyImage from '../components/ui/LazyImage';
import { getCachedData, setCachedData } from '../utils/productCache';

export default function NewArrivals() {
  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  // Page header ko target karne ke liye ref
  const newArrivalsHeaderRef = useRef(null);
  const selectedCategory = searchParams.get('category') || 'All';

  // Jab bhi category change ho, smooth scroll to top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [selectedCategory]);

  const fetchNewArrivals = () => {
    const cached = getCachedData('new_arrivals');
    if (cached) {
      setProducts(cached);
      const initialQtys = {};
      cached.forEach((p) => {
        initialQtys[p.id] = 1;
      });
      setQuantities(initialQtys);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    fetch(`${API_BASE_URL}/api/products/new-arrivals`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Shop.jsx jesa exact formatting
          const formattedProducts = data.map((item) => ({
            ...item,
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.image,
            description: item.description || '',
            stock: typeof item.stock === 'number' ? item.stock : (typeof item.countInStock === 'number' ? item.countInStock : 15),
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : (item.stock === undefined || item.stock > 0),
          }));

          setCachedData('new_arrivals', formattedProducts);
          setProducts(formattedProducts);
          const initialQtys = {};
          formattedProducts.forEach((p) => {
            initialQtys[p.id] = 1;
          });
          setQuantities(initialQtys);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch new arrivals from backend:', err);
        if (!cached) {
          setProducts([]);
          setError('Server is offline or unavailable. New arrivals cannot be loaded.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNewArrivals();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = current + delta;
      return { ...prev, [id]: updated < 1 ? 1 : updated };
    });
  };

  const handleAddToCartWithQty = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart({
      ...product,
      quantity: Number(qty)
    });
  };

  const handleCategoryChange = (cat) => {
    setVisibleCount(12);
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="-mt-4 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">

        {/* Page Header (Lookbook & Shop style minimalist header) */}
        <div ref={newArrivalsHeaderRef} className="text-center max-w-2xl mx-auto mb-14 space-y-3 scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            Editorial 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900">
            NEW ARRIVALS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Discover curated fresh drops live-fetched from our latest collections.
          </p>
        </div>

        {/* Category Filters */}
        <div
          role="tablist"
          aria-label="New arrivals categories"
          className="flex flex-wrap justify-center items-center gap-6 sm:space-x-8 mb-12 text-xs uppercase tracking-widest font-medium"
        >
          {['All', 'Women', 'Men', 'Accessories'].map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(cat)}
                className={`pb-1 transition-colors cursor-pointer ${isActive
                    ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold -mb-px'
                    : 'text-neutral-500 hover:text-neutral-900'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
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
              onClick={fetchNewArrivals}
              className="mt-2 px-4 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
            No new arrivals found in this category.
          </div>
        ) : (
          /* 6-Column Compact Product Grid (Exact Shop.jsx Alignment & Styling) */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const currentQty = quantities[product.id] || 1;

                const isOutOfStock =
                  product.inStock === false ||
                  product.isOutOfStock === true ||
                  (typeof product.stock === 'number' && product.stock <= 0) ||
                  product.status === 'out_of_stock' ||
                  product.status === 'sold_out';

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white p-2.5 rounded-sm border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-xs text-left"
                  >
                    {/* Compact Product Image */}
                    <div
                      onClick={() => openQuickView(product)}
                      className="relative aspect-4/5 bg-neutral-100 overflow-hidden rounded-xs cursor-pointer group/img"
                    >
                      <LazyImage
                        src={product.image}
                        alt={product.name}
                        aspectRatio="aspect-4/5"
                        targetWidth={500}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Category Badge aligned exactly like Shop.jsx & Lookbook */}
                      <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                        {product.category}
                      </div>

                      {/* Out of Stock overlay badge */}
                      {isOutOfStock && (
                        <div className="absolute top-2 right-2 bg-rose-900/90 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs shadow-xs">
                          Sold Out
                        </div>
                      )}

                      {/* Quick View Hover Button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                        <span className="bg-white/95 text-neutral-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-xs shadow-md flex items-center gap-1.5 hover:bg-neutral-900 hover:text-white transition-colors">
                          <Eye className="w-3 h-3" />
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Product Info - Exact Shop.jsx Alignment & Styling */}
                    <div className="mt-2.5 flex flex-col flex-1 justify-between space-y-1.5">
                      <div>
                        <h3
                          onClick={() => openQuickView(product)}
                          className="text-xs font-medium text-neutral-900 line-clamp-2 leading-snug mt-0.5 cursor-pointer hover:underline"
                        >
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-[10px] text-neutral-500 font-light mt-1 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs font-semibold text-neutral-900">
                          ${product.price}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-xs">
                            Out of Stock
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Quantity Stepper & Add to Cart Controls */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
                      <div className={`flex items-center justify-between border border-neutral-200 rounded-xs bg-neutral-50 h-9 sm:h-10 ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          aria-label={`Decrease quantity for ${product.name}`}
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-neutral-900">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          aria-label={`Increase quantity for ${product.name}`}
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCartWithQty(product)}
                        className={`w-full h-9 sm:h-10 py-2.5 px-4 text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors rounded-xs flex items-center justify-center text-center ${isOutOfStock
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer'
                          }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3.5 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-all rounded-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Load More Drops</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

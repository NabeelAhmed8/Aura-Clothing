import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useQuickViewStore } from '../../store/useQuickViewStore';
import { Eye } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ProductGrid() {
  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data)) {
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

        setProducts(formattedProducts);
        const initialQtys = {};
        formattedProducts.forEach((p) => {
          initialQtys[p.id] = 1;
        });
        setQuantities(initialQtys);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products from backend:', err);
      setProducts([]);
      setError('Server is offline or unavailable. Products cannot be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (!isMounted) return;
      await fetchProducts();
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
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
    addToCart(product, qty);
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            Curated Collection
          </span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mt-1">
            BEST SELLERS
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-2.5 rounded-sm border border-neutral-200">
              <div className="aspect-3/4 bg-neutral-200 rounded-xs mb-3" />
              <div className="h-2.5 bg-neutral-200 rounded-xs w-1/3 mb-2" />
              <div className="h-3 bg-neutral-200 rounded-xs w-3/4 mb-2" />
              <div className="h-3 bg-neutral-200 rounded-xs w-1/4 mb-4" />
              <div className="h-9 bg-neutral-100 rounded-xs" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 px-6 bg-white border border-neutral-200 rounded-xs max-w-md mx-auto my-6 space-y-3">
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
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
          No products found.
        </div>
      ) : (
        /* 6 Column Grid on Large Screens */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => {
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
                className="group relative flex flex-col bg-white p-2.5 rounded-sm border border-neutral-200 transition-shadow hover:shadow-sm text-left"
              >
                {/* Product Image */}
                <div 
                  onClick={() => openQuickView(product)}
                  className="relative aspect-3/4 bg-neutral-100 overflow-hidden rounded-xs cursor-pointer group/img"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
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

                {/* Product Info & Proximity Grouped Price */}
                <div className="mt-3 flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                      {product.category}
                    </span>
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
                  <div className="flex items-center justify-between">
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

                {/* Quantity Controls & Add to Cart */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col gap-2">
                  <div className={`flex items-center justify-between border border-neutral-200 rounded-xs bg-neutral-50 h-9 sm:h-10 ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      aria-label={`Decrease quantity for ${product.name}`}
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      −
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
                    className={`w-full h-9 sm:h-10 py-2.5 px-4 text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors rounded-xs flex items-center justify-center text-center ${
                      isOutOfStock
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
      )}
    </section>
  );
}
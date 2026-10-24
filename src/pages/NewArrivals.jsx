import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeletonGrid from '../components/ui/ProductSkeletonGrid';
import ProductErrorState from '../components/ui/ProductErrorState';

const CATEGORIES = ['All', 'Men', 'Women', 'Accessories'];

export default function NewArrivals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(12);
  const newArrivalsHeaderRef = useRef(null);

  const selectedCategory = searchParams.get('category') || 'All';

  const { products, loading, error, refetch } = useProducts({
    endpoint: '/api/products/new-arrivals',
    cacheKey: 'new_arrivals',
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [selectedCategory]);

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

  const filteredProducts = products.filter((p) => {
    if (selectedCategory.toLowerCase() === 'all') return true;
    return p.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="-mt-4 bg-[#F9F9F8] flex-1 flex flex-col text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">
        {/* Page Header */}
        <div ref={newArrivalsHeaderRef} className="text-center max-w-2xl mx-auto mb-14 space-y-3 scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Collection 2026</span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900">NEW ARRIVALS</h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Discover our latest seasonal releases, minimal silhouettes, and premium fabrics.
          </p>
        </div>

        {/* Category Filters */}
        <div
          role="tablist"
          aria-label="New arrival categories"
          className="flex flex-wrap justify-center items-center gap-6 sm:space-x-8 mb-12 text-xs uppercase tracking-widest font-medium"
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(cat)}
                className={`pb-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold -mb-px'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid / States */}
        {loading ? (
          <ProductSkeletonGrid count={12} aspectRatio="aspect-4/5" />
        ) : error ? (
          <ProductErrorState
            error={error}
            onRetry={refetch}
            message="Backend server connect nahi ho raha. Server start karein aur retry karein."
          />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
            No new arrivals found in this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} product={product} aspectRatio="aspect-4/5" badgeStyle="floating" />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-12 mb-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3.5 border border-neutral-900 bg-white text-neutral-900 text-xs uppercase tracking-widest font-bold hover:bg-neutral-900 hover:text-white transition-all rounded-xs cursor-pointer inline-flex items-center space-x-2 shadow-xs"
                >
                  <span>Load More Products ({filteredProducts.length - visibleCount} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

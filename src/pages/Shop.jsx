import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeletonGrid from '../components/ui/ProductSkeletonGrid';
import ProductErrorState from '../components/ui/ProductErrorState';
import Footer from '../components/Layout/Footer';

const CATEGORIES = ['All', 'Men', 'Women', 'Accessories'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(12);
  const shopHeaderRef = useRef(null);

  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const { products, loading, error, refetch } = useProducts({
    endpoint: '/api/products',
    cacheKey: 'all_products',
  });

  // Reset pagination when category or search changes
  const filterKey = `${selectedCategory}_${searchQuery}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(12);
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory.toLowerCase() === 'all' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="-mt-4 bg-[#F9F9F8] flex-1 flex flex-col text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">
        {/* Page Header */}
        <div ref={shopHeaderRef} className="text-center max-w-2xl mx-auto mb-14 space-y-3 scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Catalog 2026</span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900">THE SHOP</h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Explore live curated collections directly from our database inventory.
          </p>
        </div>

        {/* Category Filters */}
        <div
          role="tablist"
          aria-label="Product categories"
          className="flex flex-wrap justify-center items-center gap-6 sm:space-x-8 mb-8 text-xs uppercase tracking-widest font-medium"
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

        {/* Active Search Filter Banner */}
        {searchQuery && (
          <div className="flex items-center justify-center gap-2 mb-10 text-xs text-neutral-600 bg-neutral-100 py-2.5 px-4 rounded-xs max-w-md mx-auto border border-neutral-200">
            <span>
              Searching: <strong className="text-neutral-900">"{searchQuery}"</strong>
            </span>
            <span className="text-neutral-400">•</span>
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-neutral-900 underline font-bold hover:text-neutral-600 cursor-pointer ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Products Grid / States */}
        {loading ? (
          <ProductSkeletonGrid count={12} aspectRatio="aspect-4/5" />
        ) : error ? (
          <ProductErrorState error={error} onRetry={refetch} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
            No products found in this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} product={product} aspectRatio="aspect-4/5" badgeStyle="floating" />
              ))}
            </div>

            {/* Progressive Loading Controls */}
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

      <Footer />
    </div>
  );
}

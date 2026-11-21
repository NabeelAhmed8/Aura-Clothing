import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeletonGrid from '../components/ui/ProductSkeletonGrid';
import ProductErrorState from '../components/ui/ProductErrorState';
import Pagination from '../components/ui/Pagination';

const CATEGORIES = ['All', 'Men', 'Women', 'Accessories'];
const ITEMS_PER_PAGE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shopHeaderRef = useRef(null);

  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const rawPage = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

  const { products, loading, error, refetch } = useProducts({
    endpoint: '/api/products',
    cacheKey: 'all_products',
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [selectedCategory, searchQuery]);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(rawPage, totalPages);

  // If URL page exceeds available pages after filtering, correct it
  useEffect(() => {
    if (rawPage > totalPages && totalPages > 0) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    }
  }, [rawPage, totalPages, searchParams, setSearchParams]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const nextParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', newPage.toString());
    }
    setSearchParams(nextParams);

    if (shopHeaderRef.current) {
      shopHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page'); // Reset to page 1 on category change
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
    nextParams.delete('page'); // Reset to page 1 on clear
    setSearchParams(nextParams);
  };

  return (
    <div className="-mt-4 bg-[#F9F9F8] flex-1 flex flex-col text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <div ref={shopHeaderRef} className="text-center max-w-2xl mx-auto mb-14 space-y-3 scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Catalog 2026</span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900">THE SHOP</h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Explore live curated collections directly from our database inventory.
          </p>
        </div>

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

        {loading ? (
          <ProductSkeletonGrid count={12} aspectRatio="aspect-4/5" />
        ) : error ? (
          <ProductErrorState onRetry={refetch} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
            No products found in this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} aspectRatio="aspect-4/5" badgeStyle="floating" />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              className="mt-14"
            />
          </>
        )}
      </main>
    </div>
  );
}

import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ui/ProductCard';
import ProductSkeletonGrid from '../ui/ProductSkeletonGrid';
import ProductErrorState from '../ui/ProductErrorState';

export default function ProductGrid() {
  const { products, loading, error, refetch } = useProducts({
    endpoint: '/api/products',
    cacheKey: 'all_products',
  });

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
        <ProductSkeletonGrid count={6} aspectRatio="aspect-3/4" />
      ) : error ? (
        <ProductErrorState error={error} onRetry={refetch} />
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              aspectRatio="aspect-3/4"
              badgeStyle="inline"
            />
          ))}
        </div>
      )}
    </section>
  );
}

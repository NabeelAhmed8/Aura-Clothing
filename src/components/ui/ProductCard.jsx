import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useQuickViewStore } from '../../store/useQuickViewStore';
import LazyImage from './LazyImage';

export default function ProductCard({
  product,
  aspectRatio = 'aspect-4/5',
  badgeStyle = 'floating', // 'floating' | 'inline'
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);

  const [quantity, setQuantity] = useState(1);

  const isOutOfStock =
    product.inStock === false ||
    product.isOutOfStock === true ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    product.status === 'out_of_stock' ||
    product.status === 'sold_out';

  const handleQuantityDelta = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: Number(quantity),
    });
  };

  return (
    <div className="group relative flex flex-col bg-white p-2.5 rounded-sm border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-xs text-left">
      {/* Product Image with Quick View Hover */}
      <div
        onClick={() => openQuickView(product)}
        className={`relative ${aspectRatio} bg-neutral-100 overflow-hidden rounded-xs cursor-pointer group/img`}
      >
        <LazyImage
          src={product.image}
          alt={product.name}
          aspectRatio={aspectRatio}
          targetWidth={500}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Category Badge */}
        {badgeStyle === 'floating' && product.category && (
          <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
            {product.category}
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-rose-900/90 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs shadow-xs">
            Sold Out
          </div>
        )}

        {/* Quick View Hover Overlay */}
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
          {badgeStyle === 'inline' && product.category && (
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
              {product.category}
            </span>
          )}
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
          {isOutOfStock && (
            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-xs">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Quantity Stepper & Add to Cart Controls */}
      <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
        <div
          className={`flex items-center justify-between border border-neutral-200 rounded-xs bg-neutral-50 h-9 sm:h-10 ${
            isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={`Decrease quantity for ${product.name}`}
            onClick={() => handleQuantityDelta(-1)}
            className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="text-xs font-semibold text-neutral-900">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={`Increase quantity for ${product.name}`}
            onClick={() => handleQuantityDelta(1)}
            className="w-8 sm:w-9 h-full flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
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
}

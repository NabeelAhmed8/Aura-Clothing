import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function EmptyCartView() {
  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-5 bg-white border border-neutral-200">
      <div className="w-14 h-14 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-600">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-light uppercase tracking-wider text-neutral-900">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-neutral-500">
          Add pieces from our latest collection to proceed to checkout.
        </p>
      </div>
      <Link
        to="/shop"
        className="inline-flex items-center justify-center space-x-2 bg-neutral-900 text-white px-6 sm:px-8 py-3.5 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors text-center"
      >
        <span>Explore Collection</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function CheckoutSummary({
  cart,
  cartTotal,
  user,
  paymentMethod,
  isProcessing,
  processingStatus,
}) {
  return (
    <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 h-fit text-left">
      <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 text-left border-b border-neutral-100 pb-3">
        Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
      </h3>

      <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto pr-1">
        {cart.map((item, index) => (
          <div key={item._id || item.id || index} className="py-3 flex justify-between text-xs text-left">
            <div className="text-left space-y-0.5">
              <p className="font-medium text-neutral-900 text-left">{item.name}</p>
              <p className="text-neutral-400 text-[10px] text-left">
                Qty: {item.quantity || 1} {item.size ? `• Size: ${item.size}` : ''}
              </p>
            </div>
            <p className="font-semibold text-neutral-900 text-right">
              ${((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-500">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Express Delivery</span>
          <span className="text-emerald-700 font-medium">Free (Complimentary)</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-100">
          <span>Total Payable</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button: Requires Login */}
      {!user ? (
        <div className="space-y-2.5">
          <Link
            to="/login?redirect=/checkout"
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center text-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In to Place Order</span>
          </Link>
          <p className="text-[11px] text-center text-neutral-500 leading-normal">
            You must sign in to place your order. Your items stay safely in your bag.
          </p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isProcessing || cart.length === 0}
          className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center text-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{processingStatus || 'Processing Payment...'}</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>
                {paymentMethod === 'Stripe'
                  ? `Pay with Stripe ($${cartTotal.toFixed(2)})`
                  : `Place COD Order ($${cartTotal.toFixed(2)})`}
              </span>
            </>
          )}
        </button>
      )}

      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-400 pt-1 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
        <span>Verified Stripe Checkout • 256-Bit SSL Protection</span>
      </div>
    </div>
  );
}

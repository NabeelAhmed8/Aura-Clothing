import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, Banknote, Copy, Check } from 'lucide-react';

export default function OrderSuccessView({ order, fallbackCustomerName = 'Valued Customer', cartTotal = 0 }) {
  const [copiedId, setCopiedId] = useState(false);
  const isPaidWithStripe = order.paymentMethod === 'Stripe';

  const handleCopyTransactionId = (txnId) => {
    if (!txnId) return;
    navigator.clipboard.writeText(txnId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto pt-6 px-6 min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xs ${
          isPaidWithStripe
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-neutral-100 text-neutral-900 border-neutral-300'
        }`}
      >
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span
          className={`text-[10px] uppercase tracking-widest font-bold block ${
            isPaidWithStripe ? 'text-emerald-800' : 'text-neutral-600'
          }`}
        >
          {isPaidWithStripe ? 'Payment Verified & Order Confirmed' : 'Order Placed • Cash on Delivery'}
        </span>
        <h2 className="text-3xl font-light uppercase tracking-wider text-neutral-900">
          Order Confirmed
        </h2>
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono pt-1">
          Order Reference: #{order._id || order.id}
        </p>
      </div>

      <div className="text-sm text-neutral-600 font-light max-w-md space-y-3 w-full">
        <p>
          Thank you, <strong>{order.customer?.name || fallbackCustomerName}</strong>. Your order of{' '}
          <strong className="text-neutral-900">${(order.totalAmount ?? cartTotal).toFixed(2)}</strong> has
          been successfully received.
        </p>

        <div className="bg-neutral-100 p-4 rounded-xs text-xs text-neutral-800 space-y-2.5 border border-neutral-200 text-left">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Payment Status:</span>
            <span
              className={`px-2 py-0.5 rounded-2xs text-[10px] uppercase font-bold tracking-wider ${
                isPaidWithStripe
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {order.paymentStatus || (isPaidWithStripe ? 'Paid' : 'Pending')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Payment Gateway:</span>
            <strong className="text-neutral-900 font-semibold flex items-center gap-1.5">
              {isPaidWithStripe ? (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                  Stripe (Credit / Debit Card)
                </>
              ) : (
                <>
                  <Banknote className="w-3.5 h-3.5 text-neutral-700" />
                  Cash on Delivery
                </>
              )}
            </strong>
          </div>

          {order.transactionId && (
            <div className="flex justify-between items-center border-t border-neutral-200 pt-2 text-[11px] font-mono text-neutral-600">
              <span className="text-neutral-500">Transaction ID:</span>
              <div className="flex items-center space-x-1">
                <span className="truncate max-w-[180px] sm:max-w-xs">{order.transactionId}</span>
                <button
                  type="button"
                  onClick={() => handleCopyTransactionId(order.transactionId)}
                  className="p-1 hover:text-neutral-900 transition-colors cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-sm">
        <Link
          to="/shop"
          className="flex-1 bg-neutral-900 text-white py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center text-center"
        >
          Continue Shopping
        </Link>
        <Link
          to="/profile?tab=orders"
          className="flex-1 bg-white text-neutral-900 border border-neutral-300 py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:border-neutral-900 transition-colors flex items-center justify-center text-center"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

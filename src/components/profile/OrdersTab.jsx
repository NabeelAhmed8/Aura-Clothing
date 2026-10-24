import { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function OrdersTab({ user }) {
  const [orders, setOrders] = useState(() => (Array.isArray(user?.orders) ? user.orders : []));
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return;
    setIsLoadingOrders(true);
    try {
      const queryParams = new URLSearchParams({ email: user.email.trim() });
      if (user._id || user.id) queryParams.append('userId', user._id || user.id);
      const res = await fetch(`${API_BASE_URL}/api/orders/user-orders?${queryParams.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (Array.isArray(user.orders)) {
        setOrders(user.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (Array.isArray(user?.orders)) setOrders(user.orders);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="text-left">
          <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">
            Order History
          </h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">
            Track and review your purchases
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={isLoadingOrders}
          className="border border-neutral-300 hover:border-neutral-900 px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 self-start sm:self-auto"
        >
          <Clock className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
          <span>{isLoadingOrders ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {isLoadingOrders ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm text-xs text-neutral-500 uppercase tracking-widest">
          Loading orders...
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
          <Package className="w-8 h-8 text-neutral-400" />
          <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">
            No orders placed yet
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {orders.map((ord) => (
            <div
              key={ord._id || ord.id || ord.orderId}
              className="bg-neutral-50 border border-neutral-200 p-5 rounded-sm space-y-3 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3 text-left">
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono text-left">
                    Order #{ord._id || ord.id || ord.orderId}
                  </p>
                  <p className="text-[10px] text-neutral-400 uppercase text-left">
                    Date: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-xs flex items-center space-x-1 ${
                      ord.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.paymentStatus === 'Paid' ? (
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 inline mr-1" />
                    )}
                    {ord.paymentStatus}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-neutral-900 text-white rounded-xs">
                    {ord.orderStatus || 'Processing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-left">
                <div className="text-left">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">
                    Payment Via
                  </span>
                  <span className="font-medium text-neutral-900 text-left">{ord.paymentMethod}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">
                    Total Amount
                  </span>
                  <span className="font-semibold text-neutral-900 text-left">${ord.totalAmount}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">
                    Delivery City
                  </span>
                  <span className="text-neutral-600 truncate block text-left">
                    {ord.customer?.city || 'N/A'}
                  </span>
                </div>
              </div>

              {ord.items && ord.items.length > 0 && (
                <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 text-left">
                  {ord.items.map((it, idx) => (
                    <span key={idx}>
                      {it.name} (x{it.quantity || 1})
                      {idx < ord.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Truck, CheckCircle2, ShieldCheck, AlertCircle, X, ArrowRight, ShoppingBag } from 'lucide-react';
import Footer from '../components/Layout/Footer';
import { API_BASE_URL } from '../config/api';

function CheckoutFormContent() {
  const { cart, clearCart, showToast, user, addOrderToUser, addAddressToUser } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [formError, setFormError] = useState(null);

  // Pre-fill user data if logged in
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [customer, setCustomer] = useState(() => ({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '' : '',
    email: user?.email || '',
    phone: user?.phone || defaultAddress?.phone || '',
    address: defaultAddress?.streetAddress || '',
    city: defaultAddress?.city || '',
  }));

  // Automatically save checkout delivery address to user's account and Address tab
  const saveCheckoutAddressToUser = async (customerData) => {
    if (!customerData?.address?.trim() || !customerData?.city?.trim()) return;

    const addressPayload = {
      fullName: (customerData.name || '').trim(),
      phone: (customerData.phone || '').trim(),
      streetAddress: customerData.address.trim(),
      city: customerData.city.trim(),
      country: 'Pakistan',
    };

    // 1. Immediately update Zustand store & localStorage for logged-in user
    let updatedAddresses = null;
    if (user && addAddressToUser) {
      updatedAddresses = addAddressToUser(addressPayload);
    }

    // 2. Sync to MongoDB user profile
    const targetEmail = user?.email || customerData.email?.trim();
    if (targetEmail) {
      try {
        if (updatedAddresses) {
          await fetch(`${API_BASE_URL}/api/auth/update-user`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetEmail,
              addresses: updatedAddresses,
            }),
          });
        } else {
          const profileRes = await fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(targetEmail)}`);
          const profileData = await profileRes.json();
          if (profileData?.success && profileData?.user) {
            const list = Array.isArray(profileData.user.addresses) ? [...profileData.user.addresses] : [];
            const normStreet = addressPayload.streetAddress.toLowerCase();
            const normCity = addressPayload.city.toLowerCase();
            const exists = list.some(
              (a) => (a.streetAddress || '').trim().toLowerCase() === normStreet && (a.city || '').trim().toLowerCase() === normCity
            );
            if (!exists) {
              const isFirst = list.length === 0;
              list.push({ ...addressPayload, isDefault: isFirst });
              await fetch(`${API_BASE_URL}/api/auth/update-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: targetEmail,
                  addresses: list,
                }),
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync checkout address to backend:', err);
      }
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.address.trim() ||
      !customer.phone.trim() ||
      !customer.city.trim()
    ) {
      setFormError('Please fill all required delivery details (Name, Email, Phone, City, Address).');
      showToast('Please fill all delivery details');
      return;
    }

    if (cart.length === 0) {
      setFormError('Your cart is empty. Please add items before checking out.');
      showToast('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || user?.id || null,
          customer: {
            ...customer,
            email: customer.email.trim(),
          },
          items: cart,
          totalAmount: cartTotal,
          paymentMethod: 'Direct Order',
        }),
      });

      const data = await res.json();
      if (res.ok && (data.data || data.order)) {
        const confirmedOrder = data.data || data.order;
        clearCart();
        setOrderComplete(confirmedOrder);
        if (addOrderToUser) addOrderToUser(confirmedOrder);
        await saveCheckoutAddressToUser(customer);
        showToast('Order confirmed successfully!');
      } else {
        setFormError(data.message || 'Failed to place order. Please try again.');
        showToast(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      setFormError(err.message || 'Network error occurred. Please ensure backend server is reachable.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Confirmed State
  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto pt-6 px-6 min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold block">
            Order Verified & Confirmed
          </span>
          <h2 className="text-3xl font-light uppercase tracking-wider text-neutral-900">
            Order Confirmed
          </h2>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono pt-1">
            Order Reference: #{orderComplete._id || orderComplete.id}
          </p>
        </div>

        <div className="text-sm text-neutral-600 font-light max-w-md space-y-3">
          <p>
            Thank you, <strong>{orderComplete.customer?.name || customer.name || 'Valued Customer'}</strong>. Your order of{' '}
            <strong className="text-neutral-900">${orderComplete.totalAmount ?? cartTotal.toFixed(2)}</strong> has been successfully placed.
          </p>
          <div className="bg-neutral-100 p-4 rounded-xs text-xs text-neutral-800 space-y-2 border border-neutral-200 text-left">
            <p className="flex justify-between">
              <span className="text-neutral-500">Order Status:</span>
              <strong className="text-emerald-700 font-semibold">
                Confirmed & Processing
              </strong>
            </p>
            {orderComplete.transactionId && (
              <p className="flex justify-between border-t border-neutral-200 pt-1.5 mt-1.5 text-[11px] font-mono text-neutral-600">
                <span>Tracking / Ref:</span>
                <span>{orderComplete.transactionId}</span>
              </p>
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

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center space-y-5 bg-white border border-neutral-200">
        <div className="w-14 h-14 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-light uppercase tracking-wider text-neutral-900">Your Cart is Empty</h2>
          <p className="text-xs text-neutral-500">Add pieces from our latest collection to proceed to checkout.</p>
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

  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      action="#"
      autoComplete="on"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
    >
      {/* 1. Delivery Details */}
      <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-neutral-100 pb-3 min-w-0">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 shrink-0">
            1. Delivery Details
          </h3>
          {user && (
            <span 
              className="text-[10px] text-neutral-500 uppercase tracking-wider truncate min-w-0 max-w-full" 
              title={`Logged in as ${user.email}`}
            >
              Logged in as{' '}
              <strong className="text-neutral-900 lowercase font-semibold">{user.email}</strong>
            </span>
          )}
        </div>

        {/* Quick Saved Address Picker for Logged-in Users */}
        {Array.isArray(user?.addresses) && user.addresses.length > 0 && (
          <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-xs space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
                Select From Saved Addresses ({user.addresses.length})
              </span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider">
                Or edit details below
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.addresses.map((addr, idx) => {
                const isSelected =
                  customer.address.trim().toLowerCase() === (addr.streetAddress || '').trim().toLowerCase() &&
                  customer.city.trim().toLowerCase() === (addr.city || '').trim().toLowerCase();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomer((prev) => ({
                        ...prev,
                        name: addr.fullName || prev.name,
                        phone: addr.phone || prev.phone,
                        address: addr.streetAddress || '',
                        city: addr.city || '',
                      }));
                    }}
                    className={`text-left text-xs px-3 py-2 border rounded-xs transition-all cursor-pointer flex flex-col min-w-35 max-w-xs ${
                      isSelected
                        ? 'border-neutral-900 bg-white font-semibold shadow-xs'
                        : 'border-neutral-200 bg-white/70 hover:border-neutral-400 text-neutral-700'
                    }`}
                  >
                    <span className="font-bold text-neutral-900 uppercase text-[10px] flex items-center gap-1">
                      {addr.fullName}
                      {addr.isDefault && (
                        <span className="text-[8px] bg-neutral-900 text-white px-1 rounded-2xs font-normal">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="truncate text-[10px] text-neutral-500 mt-0.5">
                      {addr.streetAddress}, {addr.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="customer-name" className="text-[10px] uppercase tracking-wider text-neutral-500 block">
              Full Name *
            </label>
            <input
              id="customer-name"
              name="name"
              autoComplete="name"
              type="text"
              required
              value={customer.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full bg-[#F9F9F8] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 text-left transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="customer-email" className="text-[10px] uppercase tracking-wider text-neutral-500 block">
              Email Address *
            </label>
            <input
              id="customer-email"
              name="email"
              autoComplete="email"
              type="email"
              required
              value={customer.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className="w-full bg-[#F9F9F8] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 text-left transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="customer-phone" className="text-[10px] uppercase tracking-wider text-neutral-500 block">
              Phone Number *
            </label>
            <input
              id="customer-phone"
              name="phone"
              autoComplete="tel"
              type="tel"
              required
              value={customer.phone}
              onChange={handleInputChange}
              placeholder="0300 1234567"
              className="w-full bg-[#F9F9F8] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 text-left transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="customer-city" className="text-[10px] uppercase tracking-wider text-neutral-500 block">
              City *
            </label>
            <input
              id="customer-city"
              name="city"
              autoComplete="address-level2"
              type="text"
              required
              value={customer.city}
              onChange={handleInputChange}
              placeholder="Lahore, Karachi, Islamabad..."
              className="w-full bg-[#F9F9F8] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 text-left transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="customer-address" className="text-[10px] uppercase tracking-wider text-neutral-500 block">
            Complete Shipping Address *
          </label>
          <input
            id="customer-address"
            name="address"
            autoComplete="street-address"
            type="text"
            required
            value={customer.address}
            onChange={handleInputChange}
            placeholder="House/Apartment #, Street, Area..."
            className="w-full bg-[#F9F9F8] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 text-left transition-colors"
          />
        </div>

        {/* Complimentary Delivery Notice */}
        <div className="pt-4 border-t border-neutral-100 space-y-2 text-left">
          <div className="p-4 bg-[#F9F9F8] border border-neutral-200 rounded-xs flex items-start space-x-3 text-left">
            <div className="p-2 bg-neutral-900 text-white rounded-xs shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Complimentary Express Delivery
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Your order is confirmed and dispatched directly to your address with complimentary nationwide express delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="w-full pt-2 animate-fade-in">
            <div className="w-full bg-red-50 text-red-700 text-xs tracking-wide px-4 py-3 rounded-xs border border-red-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-red-400 hover:text-red-700 cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Order Summary & Direct Place Order Button */}
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
            <span>Delivery Charges</span>
            <span className="text-emerald-700 font-medium">Free (Complimentary)</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-100">
            <span>Total Payable</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || cart.length === 0}
          className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center text-center"
        >
          {isProcessing ? 'Placing Order...' : `Place Order ($${cartTotal.toFixed(2)})`}
        </button>

        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-400 pt-1 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span>Verified Order Guarantee • Doorstep Inspection</span>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  const user = useCartStore((state) => state.user);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative">
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            Atelier Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-wider text-neutral-900">
            FINAL CONFIRMATION
          </h1>
        </div>

        <CheckoutFormContent key={user?.email || user?._id || 'guest'} />
      </main>
      <Footer />
    </div>
  );
}
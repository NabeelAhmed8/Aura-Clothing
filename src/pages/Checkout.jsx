import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/useCartStore';
import { Truck, CheckCircle2, ShieldCheck, AlertCircle, Lock, X, ArrowRight, ShoppingBag } from 'lucide-react';
import Footer from '../components/Layout/Footer';
import { API_BASE_URL } from '../config/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Check that the publishable key is valid and not a placeholder
const isValidStripeKey =
  typeof stripePublishableKey === 'string' &&
  (stripePublishableKey.startsWith('pk_test_') || stripePublishableKey.startsWith('pk_live_')) &&
  !stripePublishableKey.includes('...') &&
  !stripePublishableKey.includes(' ') &&
  stripePublishableKey.length > 20;

const stripePromise = isValidStripeKey ? loadStripe(stripePublishableKey.trim()) : null;

// High-Resolution Payment Badges
const PaymentLogos = {
  JazzCash: () => (
    <div className="flex items-center space-x-1 shrink-0">
      <svg className="h-6 w-auto" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="32" rx="4" fill="#ED1C24" />
        <circle cx="16" cy="16" r="8" fill="#FFC80A" />
        <text x="30" y="21" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">JazzCash</text>
      </svg>
    </div>
  ),
  EasyPaisa: () => (
    <div className="flex items-center space-x-1 shrink-0">
      <svg className="h-6 w-auto" viewBox="0 0 105 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="105" height="32" rx="4" fill="#00A651" />
        <path d="M12 21V11H18C20 11 21.5 12.5 21.5 14.5C21.5 16.5 20 18 18 18H14.5V21H12Z" fill="#FFFFFF" />
        <circle cx="21" cy="18" r="2.5" fill="#FFFFFF" />
        <text x="28" y="21" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="12" letterSpacing="-0.3">easypaisa</text>
      </svg>
    </div>
  ),
  StripeCards: () => (
    <div className="flex items-center space-x-1.5 shrink-0">
      <span className="px-1.5 py-0.5 bg-[#1A1F71] text-white text-[9px] font-black italic rounded-xs tracking-wider">VISA</span>
      <div className="flex -space-x-1 items-center bg-neutral-100 px-1 py-0.5 rounded-xs border border-neutral-200">
        <span className="w-3 h-3 rounded-full bg-[#EB001B] inline-block opacity-90"></span>
        <span className="w-3 h-3 rounded-full bg-[#F79E1B] inline-block opacity-90"></span>
      </div>
    </div>
  ),
  PakBanks: () => (
    <div className="flex items-center space-x-1 shrink-0">
      <span className="px-1.5 py-0.5 bg-neutral-900 text-[#00A651] text-[9px] font-black rounded-xs tracking-wider border border-neutral-800">
        1<span className="text-white">LINK</span>
      </span>
      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 text-[9px] font-bold rounded-xs border border-neutral-200">
        IBAN
      </span>
      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded-xs border border-emerald-200">
        DEBIT
      </span>
    </div>
  ),
};

function CheckoutFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart, showToast, user, addOrderToUser, addAddressToUser } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [formError, setFormError] = useState(null);

  // Mobile / IBAN input
  const [accountIdentifier, setAccountIdentifier] = useState('');

  // Two-Factor OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);

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

  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    setFormError(null);
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

    if (['JazzCash', 'EasyPaisa', 'BankTransfer'].includes(paymentMethod) && !accountIdentifier.trim()) {
      setFormError(`Please enter your ${paymentMethod === 'BankTransfer' ? '1LINK IBAN, Bank Account, or Debit Card Number' : 'Mobile Account Number'}.`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. LOCAL PAYMENTS (JazzCash, EasyPaisa, BankTransfer) -> Triggers OTP Modal
      if (['JazzCash', 'EasyPaisa', 'BankTransfer'].includes(paymentMethod)) {
        const res = await fetch(`${API_BASE_URL}/api/orders/initiate-local-payment`, {
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
            paymentMethod,
            accountIdentifier: accountIdentifier.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok && data.orderId) {
          setPendingOrderId(data.orderId);
          setOtpCode('');
          setOtpError(null);
          setOtpMessage(data.message || `A 4-digit verification code has been sent to ${accountIdentifier}.`);
          setShowOtpModal(true);
        } else {
          setFormError(data.message || 'Payment initiation failed. Please check details and retry.');
          showToast(data.message || 'Payment initiation failed');
        }
      }
      // 2. CASH ON DELIVERY (Instant Confirmation)
      else if (paymentMethod === 'COD') {
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
            paymentMethod: 'COD',
          }),
        });

        const data = await res.json();
        if (res.ok && data.data) {
          clearCart();
          setOrderComplete(data.data);
          if (addOrderToUser) addOrderToUser(data.data);
          await saveCheckoutAddressToUser(customer);
          showToast('Order confirmed via Cash on Delivery!');
        } else {
          setFormError(data.message || 'Failed to place order. Please try again.');
          showToast(data.message || 'Failed to place order');
        }
      }
      // 3. INTERNATIONAL STRIPE CARD -> Triggers Bank 3D Secure OTP Popup
      else if (paymentMethod === 'Stripe') {
        if (!isValidStripeKey) {
          setFormError('Stripe publishable key is missing or not configured in environment variables.');
          setIsProcessing(false);
          return;
        }

        if (!stripe || !elements) {
          setFormError('Stripe is initializing, please wait a moment...');
          setIsProcessing(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setFormError('Card element not loaded. Please refresh the page.');
          setIsProcessing(false);
          return;
        }

        // Create Payment Intent on backend
        const intentRes = await fetch(`${API_BASE_URL}/api/orders/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal }),
        });

        const intentData = await intentRes.json();
        if (!intentRes.ok || !intentData.clientSecret) {
          setFormError(intentData.message || 'Could not initiate Stripe payment.');
          setIsProcessing(false);
          return;
        }

        // Confirm Card Payment with 3DS Handling
        const paymentResult = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: { line1: customer.address, city: customer.city },
            },
          },
        });

        if (paymentResult.error) {
          setFormError(paymentResult.error.message || 'Your card was declined.');
          setIsProcessing(false);
          return;
        }

        if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === 'succeeded') {
          const orderRes = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
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
              paymentMethod: 'Stripe',
              stripePaymentIntentId: intentData.intentId || paymentResult.paymentIntent.id,
            }),
          });

          const orderData = await orderRes.json();
          if (orderRes.ok && orderData.data) {
            clearCart();
            setOrderComplete(orderData.data);
            if (addOrderToUser) addOrderToUser(orderData.data);
            await saveCheckoutAddressToUser(customer);
            showToast('Payment successful! Order confirmed.');
          } else {
            setFormError(orderData.message || 'Payment received, but recording order failed. Please contact support.');
          }
        } else {
          setFormError('Payment was not completed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      setFormError(err.message || 'Network error occurred. Please ensure backend server is reachable.');
    } finally {
      setIsProcessing(false);
    }
  };

  // OTP Verification Submission (JazzCash / EasyPaisa / Bank Transfer)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Please enter the 4-digit code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/verify-local-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pendingOrderId,
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setShowOtpModal(false);
        clearCart();
        setOrderComplete(data.data);
        if (addOrderToUser) addOrderToUser(data.data);
        await saveCheckoutAddressToUser(customer);
        showToast('Payment verified & order confirmed successfully!');
      } else {
        setOtpError(data.message || 'Invalid authorization code. Please retry (Default: 1234).');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setOtpError('Verification request failed. Please check connection and retry.');
    } finally {
      setIsVerifyingOtp(false);
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
            Payment & Order Verified
          </span>
          <h2 className="text-3xl font-light uppercase tracking-wider text-neutral-900">
            Order Confirmed
          </h2>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono pt-1">
            Order Reference: #{orderComplete._id || orderComplete.id || pendingOrderId}
          </p>
        </div>

        <div className="text-sm text-neutral-600 font-light max-w-md space-y-3">
          <p>
            Thank you, <strong>{orderComplete.customer?.name || customer.name || 'Valued Customer'}</strong>. Your order of{' '}
            <strong className="text-neutral-900">${orderComplete.totalAmount ?? cartTotal}</strong> has been successfully placed.
          </p>
          <div className="bg-neutral-100 p-4 rounded-xs text-xs text-neutral-800 space-y-2 border border-neutral-200 text-left">
            <p className="flex justify-between">
              <span className="text-neutral-500">Payment Gateway:</span>
              <strong className="font-semibold">{orderComplete.paymentMethod || paymentMethod}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-neutral-500">Payment Status:</span>
              <strong className={orderComplete.paymentStatus === 'Paid' ? 'text-emerald-700 font-semibold' : 'text-neutral-700 font-semibold'}>
                {orderComplete.paymentStatus || (paymentMethod === 'COD' ? 'Pending (Cash on Delivery)' : 'Paid')}
              </strong>
            </p>
            {orderComplete.senderNumber && (
              <p className="flex justify-between">
                <span className="text-neutral-500">Account / Mobile:</span>
                <span className="font-mono">{orderComplete.senderNumber}</span>
              </p>
            )}
            {orderComplete.transactionId && (
              <p className="flex justify-between border-t border-neutral-200 pt-1.5 mt-1.5 text-[11px] font-mono text-neutral-600">
                <span>Transaction Ref:</span>
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
    <>
      <form
        onSubmit={handleSubmit}
        method="POST"
        action="#"
        autoComplete="on"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
      >
        {/* 1. Delivery Details */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
              1. Delivery Details
            </h3>
            {user && (
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                Logged in as <strong className="text-neutral-900">{user.email}</strong>
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

          {/* 2. Payment Method Selection */}
          <div className="pt-6 space-y-4 text-left border-t border-neutral-100">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 text-left">
              2. Payment Method
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {/* Option: JazzCash */}
              <label
                htmlFor="payment-jazzcash"
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'JazzCash' ? 'border-neutral-900 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    id="payment-jazzcash"
                    type="radio"
                    name="paymentMethod"
                    value="JazzCash"
                    checked={paymentMethod === 'JazzCash'}
                    onChange={() => handleMethodChange('JazzCash')}
                    className="accent-neutral-900 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">JazzCash Wallet</p>
                    <p className="text-[10px] text-neutral-500">Pay via JazzCash Mobile Account & MPIN</p>
                  </div>
                </div>
                <PaymentLogos.JazzCash />
              </label>

              {/* Option: EasyPaisa */}
              <label
                htmlFor="payment-easypaisa"
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'EasyPaisa' ? 'border-neutral-900 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    id="payment-easypaisa"
                    type="radio"
                    name="paymentMethod"
                    value="EasyPaisa"
                    checked={paymentMethod === 'EasyPaisa'}
                    onChange={() => handleMethodChange('EasyPaisa')}
                    className="accent-neutral-900 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Easypaisa Wallet</p>
                    <p className="text-[10px] text-neutral-500">Instant Mobile Account PIN Authorization</p>
                  </div>
                </div>
                <PaymentLogos.EasyPaisa />
              </label>

              {/* Option: Pakistani Bank Transfer & 1Link Debit Card */}
              <label
                htmlFor="payment-banktransfer"
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'BankTransfer' ? 'border-neutral-900 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    id="payment-banktransfer"
                    type="radio"
                    name="paymentMethod"
                    value="BankTransfer"
                    checked={paymentMethod === 'BankTransfer'}
                    onChange={() => handleMethodChange('BankTransfer')}
                    className="accent-neutral-900 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Pakistani Bank & Debit Card
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      1Link IBAN, Bank Account, or Pakistani Debit Card (PayPak / 1Link)
                    </p>
                  </div>
                </div>
                <PaymentLogos.PakBanks />
              </label>

              {/* Option: International Card (Stripe) */}
              <label
                htmlFor="payment-stripe"
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'Stripe' ? 'border-neutral-900 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    id="payment-stripe"
                    type="radio"
                    name="paymentMethod"
                    value="Stripe"
                    checked={paymentMethod === 'Stripe'}
                    onChange={() => handleMethodChange('Stripe')}
                    className="accent-neutral-900 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Debit / Credit Card</p>
                    <p className="text-[10px] text-neutral-500">Visa, MasterCard, Amex (3D Secure Bank OTP)</p>
                  </div>
                </div>
                <PaymentLogos.StripeCards />
              </label>

              {/* Option: Cash on Delivery */}
              <label
                htmlFor="payment-cod"
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD' ? 'border-neutral-900 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    id="payment-cod"
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => handleMethodChange('COD')}
                    className="accent-neutral-900 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Cash on Delivery</p>
                    <p className="text-[10px] text-neutral-500">Pay cash directly at doorstep upon delivery</p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-neutral-700" />
              </label>
            </div>

            {/* Account input for Wallets & Pakistani Bank / IBAN / Debit Card */}
            {['JazzCash', 'EasyPaisa', 'BankTransfer'].includes(paymentMethod) && (
              <div className="p-4 border border-neutral-200 bg-[#F9F9F8] rounded-xs space-y-2.5 mt-4 animate-fade-in text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label htmlFor="account-identifier" className="text-[10px] uppercase tracking-widest font-bold text-neutral-700 block text-left">
                    {paymentMethod === 'BankTransfer'
                      ? '1Link IBAN / Bank Account or Debit Card Number *'
                      : `${paymentMethod} Account Mobile Number *`}
                  </label>
                  {paymentMethod === 'BankTransfer' && (
                    <div className="flex items-center space-x-1 text-[9px] text-neutral-500 font-medium">
                      <span className="px-1.5 py-0.5 bg-neutral-200/70 rounded-xs">1LINK IBAN</span>
                      <span className="px-1.5 py-0.5 bg-neutral-200/70 rounded-xs">Debit Card</span>
                      <span className="px-1.5 py-0.5 bg-neutral-200/70 rounded-xs">Bank A/C</span>
                    </div>
                  )}
                </div>
                <input
                  id="account-identifier"
                  name="accountIdentifier"
                  autoComplete={paymentMethod === 'BankTransfer' ? 'off' : 'tel'}
                  type="text"
                  required
                  value={accountIdentifier}
                  onChange={(e) => {
                    setAccountIdentifier(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder={
                    paymentMethod === 'BankTransfer'
                      ? 'e.g. PK92MEZN00012345678901 (IBAN) or 16-Digit Debit Card Number'
                      : 'e.g. 0300 1234567'
                  }
                  className="w-full bg-white border border-neutral-300 p-2.5 text-xs focus:outline-none focus:border-neutral-900 font-mono text-left"
                />
                <p className="text-[10px] text-neutral-500 text-left leading-relaxed">
                  {paymentMethod === 'BankTransfer'
                    ? 'Please enter your 24-digit 1Link IBAN, bank account number, or 16-digit debit card number. You will be prompted to enter a 4-digit bank authorization OTP once you proceed..'
                    : 'A secure 4-digit authorization OTP / PIN prompt will appear when you proceed.'}
                </p>
              </div>
            )}

            {/* Stripe Card Field */}
            {paymentMethod === 'Stripe' && (
              <div className="p-4 border border-neutral-200 bg-[#F9F9F8] rounded-xs space-y-3 mt-4 text-left">
                
                    <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-600 block text-left">
                   Card Details
                 </span>

                {!isValidStripeKey ? (
                  <div className="flex items-center space-x-2 text-xs text-amber-800 bg-amber-50 p-3 border border-amber-200 rounded-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Missing valid `VITE_STRIPE_PUBLISHABLE_KEY` in environment variables. Please use JazzCash, EasyPaisa, Bank Transfer, or COD.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-neutral-300 rounded-xs min-h-11">
                    <CardElement
                      onChange={(event) => {
                        if (event.error) {
                          setFormError(event.error.message);
                        } else if (formError) {
                          setFormError(null);
                        }
                      }}
                      options={{
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: '14px',
                            color: '#171717',
                            fontFamily: 'inherit',
                            '::placeholder': { color: '#a3a3a3' },
                          },
                          invalid: { color: '#dc2626' },
                        },
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-400 pt-1 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  <span>256-bit SSL encrypted secure transmission powered by Stripe</span>
                </div>
              </div>
            )}

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
        </div>

        {/* 3. Order Summary & Button */}
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
            {isProcessing
              ? 'Authorizing Order...'
              : paymentMethod === 'COD'
              ? `Place Order via COD ($${cartTotal.toFixed(2)})`
              : paymentMethod === 'Stripe'
              ? `Pay Now via Card ($${cartTotal.toFixed(2)})`
              : `Proceed with ${paymentMethod} ($${cartTotal.toFixed(2)})`}
          </button>
        </div>
      </form>

      {/* LUXURY IN-APP PIN / OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-neutral-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-5 relative">
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setIsProcessing(false);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-neutral-100 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5 text-neutral-900" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                Two-Factor Security
              </span>
              <h4 className="text-base uppercase tracking-wider font-light text-neutral-900">
                Authorize {paymentMethod === 'BankTransfer' ? '1Link / Debit Card' : paymentMethod}
              </h4>
              <p className="text-xs text-neutral-500">
                Enter the 4-digit code sent to <strong className="text-neutral-800">{accountIdentifier}</strong>:
              </p>
              {otpMessage && (
                <p className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-xs border border-neutral-200 mt-2 font-mono">
                  {otpMessage}
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-4">
              <label htmlFor="otp-verification-code" className="sr-only">Authorization Code or PIN</label>
              <input
                id="otp-verification-code"
                name="otpCode"
                autoComplete="one-time-code"
                type="password"
                maxLength={6}
                autoFocus
                required
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  if (otpError) setOtpError(null);
                }}
                placeholder="• • • •"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono border-b-2 border-neutral-900 py-2 focus:outline-none bg-transparent placeholder:tracking-normal placeholder:text-neutral-300"
              />

              {otpError && (
                <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xs border border-red-200">
                  {otpError}
                </p>
              )}

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length < 4}
                className="w-full bg-neutral-900 text-white py-3 sm:py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center text-center"
              >
                {isVerifyingOtp ? 'Verifying PIN...' : `Confirm & Pay $${cartTotal.toFixed(2)}`}
              </button>
            </form>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
              <span>Encrypted Banking Transmission</span>
            </div>
          </div>
        </div>
      )}
    </>
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

        <Elements stripe={stripePromise}>
          <CheckoutFormContent key={user?.email || user?._id || 'guest'} />
        </Elements>
      </main>
      <Footer />
    </div>
  );
}
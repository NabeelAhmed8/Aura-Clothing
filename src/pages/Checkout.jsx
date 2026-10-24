import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/useCartStore';
import {
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  X,
  CreditCard,
  Lock,
  Banknote,
  UserCheck,
} from 'lucide-react';
import Footer from '../components/Layout/Footer';
import { API_BASE_URL } from '../config/api';

import OrderSuccessView from '../components/checkout/OrderSuccessView';
import EmptyCartView from '../components/checkout/EmptyCartView';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import AccountIdentificationGateway from '../components/checkout/AccountIdentificationGateway';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#171717',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#a3a3a3',
      },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
  hidePostalCode: true,
};

function CheckoutFormContent() {
  const stripe = useStripe();
  const elements = useElements();

  const { cart, clearCart, showToast, user, addOrderToUser, addAddressToUser } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [orderComplete, setOrderComplete] = useState(null);
  const [formError, setFormError] = useState(null);
  const [cardError, setCardError] = useState(null);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [customer, setCustomer] = useState(() => ({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '' : '',
    email: user?.email || '',
    phone: user?.phone || defaultAddress?.phone || '',
    address: defaultAddress?.streetAddress || '',
    city: defaultAddress?.city || '',
  }));

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);

  const saveCheckoutAddressToUser = async (customerData) => {
    if (!customerData?.address?.trim() || !customerData?.city?.trim()) return;

    const addressPayload = {
      fullName: (customerData.name || '').trim(),
      phone: (customerData.phone || '').trim(),
      streetAddress: customerData.address.trim(),
      city: customerData.city.trim(),
      country: 'Pakistan',
    };

    let updatedAddresses = null;
    if (user && addAddressToUser) {
      updatedAddresses = addAddressToUser(addressPayload);
    }

    const targetEmail = user?.email || customerData.email?.trim();
    if (targetEmail && updatedAddresses) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/update-user`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            addresses: updatedAddresses,
          }),
        });
      } catch (err) {
        console.error('Failed to sync checkout address to backend:', err);
      }
    }
  };

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setCardError(null);

    if (!user) {
      setFormError('Account required: Please log in or create an account before placing an order.');
      showToast('Please sign in to place your order');
      return;
    }

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
      const activeUserId = user._id || user.id;

      if (paymentMethod === 'Stripe') {
        if (!stripe || !elements) {
          throw new Error('Stripe payment service is initializing. Please wait a few seconds and retry.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card input element is not ready. Please refresh the page.');
        }

        setProcessingStatus('Creating secure Stripe payment session...');

        const intentRes = await fetch(`${API_BASE_URL}/api/orders/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: cartTotal,
            currency: 'usd',
            userId: activeUserId,
            customer: {
              name: customer.name.trim(),
              email: (user.email || customer.email).trim(),
              phone: customer.phone.trim(),
            },
          }),
        });

        const intentData = await intentRes.json();
        if (!intentRes.ok || !intentData.clientSecret) {
          throw new Error(intentData.message || 'Unable to establish payment session with Stripe.');
        }

        setProcessingStatus('Securing and authorizing your card transaction...');

        const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customer.name.trim(),
              email: (user.email || customer.email).trim(),
              phone: customer.phone.trim(),
              address: {
                line1: customer.address.trim(),
                city: customer.city.trim(),
                country: 'PK',
              },
            },
          },
        });

        if (stripeErr) {
          throw new Error(stripeErr.message || 'Payment authentication failed. Please check card details.');
        }

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
          throw new Error(`Payment could not be completed. Status: ${paymentIntent?.status || 'Unknown'}`);
        }

        setProcessingStatus('Confirming and saving your order...');

        const orderRes = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: activeUserId,
            customer: {
              ...customer,
              email: (user.email || customer.email).trim(),
            },
            items: cart,
            totalAmount: cartTotal,
            paymentMethod: 'Stripe',
            stripePaymentIntentId: paymentIntent.id,
          }),
        });

        const orderData = await orderRes.json();
        if (orderRes.ok && (orderData.data || orderData.order)) {
          const confirmedOrder = orderData.data || orderData.order;
          clearCart();
          setOrderComplete(confirmedOrder);
          if (addOrderToUser) addOrderToUser(confirmedOrder);
          await saveCheckoutAddressToUser(customer);
          showToast('Payment successful! Order confirmed.');
        } else {
          throw new Error(orderData.message || 'Payment succeeded but order saving encountered an issue.');
        }
      } else {
        setProcessingStatus('Placing your order...');

        const orderRes = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: activeUserId,
            customer: {
              ...customer,
              email: (user.email || customer.email).trim(),
            },
            items: cart,
            totalAmount: cartTotal,
            paymentMethod: 'Cash on Delivery',
          }),
        });

        const orderData = await orderRes.json();
        if (orderRes.ok && (orderData.data || orderData.order)) {
          const confirmedOrder = orderData.data || orderData.order;
          clearCart();
          setOrderComplete(confirmedOrder);
          if (addOrderToUser) addOrderToUser(confirmedOrder);
          await saveCheckoutAddressToUser(customer);
          showToast('Order confirmed successfully!');
        } else {
          throw new Error(orderData.message || 'Failed to place order. Please try again.');
        }
      }
    } catch (err) {
      console.error('Checkout Submission Error:', err);
      setFormError(err.message || 'An unexpected error occurred during checkout.');
      showToast(err.message || 'Checkout error');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  if (orderComplete) {
    return (
      <OrderSuccessView
        order={orderComplete}
        fallbackCustomerName={customer.name}
        cartTotal={cartTotal}
      />
    );
  }

  if (cart.length === 0) {
    return <EmptyCartView />;
  }

  const isTestMode = stripePublishableKey.startsWith('pk_test_');

  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      action="#"
      autoComplete="on"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
    >
      {/* Auth Gate Banner for Guests */}
      {!user && (
        <div className="lg:col-span-12 bg-white border border-neutral-900/15 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in text-left">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xs shrink-0 mt-0.5">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-2xs">
                  Login Required
                </span>
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                Sign In to Complete Your Order
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
                Orders can only be placed through an active AURA account for verified delivery tracking and invoice safety.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link
              to="/login?redirect=/checkout"
              className="flex-1 sm:flex-initial bg-neutral-900 text-white px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors text-center shadow-2xs"
            >
              Sign In
            </Link>
            <Link
              to="/register?redirect=/checkout"
              className="flex-1 sm:flex-initial bg-white text-neutral-900 border border-neutral-300 px-5 py-3 text-xs uppercase tracking-widest font-bold hover:border-neutral-900 transition-colors text-center"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Delivery Details & Payment Method */}
      <div className="lg:col-span-7 space-y-8 text-left">
        {/* 1. Delivery Details */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-neutral-100 pb-3 min-w-0">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 shrink-0">
              1. Delivery Details
            </h3>
            {user ? (
              <span
                className="text-[10px] text-emerald-800 uppercase tracking-wider truncate min-w-0 max-w-full flex items-center gap-1 font-semibold"
                title={`Logged in as ${user.email}`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                Signed in as <strong className="text-neutral-900 lowercase">{user.email}</strong>
              </span>
            ) : (
              <Link
                to="/login?redirect=/checkout"
                className="text-[10px] text-neutral-900 underline font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
              >
                Sign in to auto-fill details
              </Link>
            )}
          </div>

          {/* Quick Saved Address Picker */}
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
        </div>

        {/* 2. Payment Method */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 text-left">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
              2. Payment Method
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Stripe Card Option */}
            <div
              onClick={() => setPaymentMethod('Stripe')}
              className={`p-4 border rounded-xs cursor-pointer transition-all ${
                paymentMethod === 'Stripe'
                  ? 'border-neutral-900 bg-neutral-50/60 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'Stripe' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}
                  >
                    {paymentMethod === 'Stripe' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Credit / Debit Card
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Instant online payment via Stripe
                    </p>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center space-x-1.5 text-[9px] text-neutral-400 font-mono">
                <span className="font-semibold text-neutral-600">VISA</span>
                <span>•</span>
                <span className="font-semibold text-neutral-600">MASTERCARD</span>
                <span>•</span>
                <span className="font-semibold text-neutral-600">AMEX</span>
              </div>
            </div>

            {/* Cash on Delivery Option */}
            <div
              onClick={() => setPaymentMethod('Cash on Delivery')}
              className={`p-4 border rounded-xs cursor-pointer transition-all ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-neutral-900 bg-neutral-50/60 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'Cash on Delivery' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}
                  >
                    {paymentMethod === 'Cash on Delivery' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Cash on Delivery
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Pay upon package arrival
                    </p>
                  </div>
                </div>
                <Banknote className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="mt-2.5 pt-2 border-t border-neutral-200/60 text-[9px] text-neutral-400 font-mono">
                <span>DOORSTEP VERIFICATION</span>
              </div>
            </div>
          </div>

          {/* Stripe Card Element Input Box */}
          {paymentMethod === 'Stripe' && (
            <div className="space-y-3 pt-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                  Card Information *
                </label>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> PCI-DSS Level 1
                </span>
              </div>

              <div className="bg-[#F9F9F8] border border-neutral-200 p-3.5 rounded-xs transition-colors focus-within:border-neutral-900 focus-within:bg-white shadow-2xs">
                {stripePromise ? (
                  <CardElement
                    options={CARD_ELEMENT_OPTIONS}
                    onChange={(e) => {
                      if (e.error) {
                        setCardError(e.error.message);
                      } else {
                        setCardError(null);
                      }
                    }}
                  />
                ) : (
                  <p className="text-xs text-red-500">
                    Stripe configuration missing. Please verify VITE_STRIPE_PUBLISHABLE_KEY in .env.
                  </p>
                )}
              </div>

              {cardError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {cardError}
                </p>
              )}

              {isTestMode && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xs text-[11px] text-amber-900 space-y-0.5">
                  <p className="font-semibold uppercase tracking-wider text-[10px] text-amber-800">
                    Stripe Test Mode Active
                  </p>
                  <p className="text-neutral-600 text-[10px]">
                    Use test card number <span className="font-mono font-bold text-neutral-900">4242 • 4242 • 4242 • 4242</span> with any future date and 3-digit CVC to complete this order.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Delivery Notice */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="p-3.5 bg-[#F9F9F8] border border-neutral-200 rounded-xs flex items-start space-x-3 text-left">
              <div className="p-2 bg-neutral-900 text-white rounded-xs shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Complimentary Express Delivery
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Your order is dispatched in our signature atelier packaging with free nationwide express courier tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="w-full pt-1 animate-fade-in">
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

      {/* RIGHT COLUMN: Order Summary */}
      <CheckoutSummary
        cart={cart}
        cartTotal={cartTotal}
        user={user}
        paymentMethod={paymentMethod}
        isProcessing={isProcessing}
        processingStatus={processingStatus}
      />
    </form>
  );
}

export default function Checkout() {
  const user = useCartStore((state) => state.user);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!user) {
    return (
      <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans flex flex-col justify-between">
        <AccountIdentificationGateway />
        <Footer />
      </div>
    );
  }

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

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CheckoutFormContent key={user?.email || user?._id || 'guest'} />
          </Elements>
        ) : (
          <CheckoutFormContent key={user?.email || user?._id || 'guest'} />
        )}
      </main>
      <Footer />
    </div>
  );
}

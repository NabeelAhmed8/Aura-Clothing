import { useState } from 'react';
import { CreditCard, Plus, Trash2, Smartphone, Building2, Package, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function PaymentTab({ user, setUser, showToast }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    methodType: 'JazzCash',
    title: '',
    accountNumber: '',
    accountHolder: '',
    isDefault: false,
  });

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.accountNumber.trim()) {
      showToast('Please enter an account or card number');
      return;
    }

    const currentMethods = Array.isArray(user.paymentMethods) ? user.paymentMethods : [];
    const makeDefault = paymentData.isDefault || currentMethods.length === 0;

    const defaultTitle =
      paymentData.methodType === 'JazzCash'
        ? 'JazzCash Mobile Account'
        : paymentData.methodType === 'EasyPaisa'
        ? 'Easypaisa Mobile Account'
        : paymentData.methodType === 'BankTransfer'
        ? '1Link Bank / IBAN'
        : paymentData.methodType === 'Stripe'
        ? 'Debit / Credit Card'
        : 'Payment Account';

    const newEntry = {
      ...paymentData,
      title: paymentData.title.trim() || defaultTitle,
      accountNumber: paymentData.accountNumber.trim(),
      accountHolder:
        paymentData.accountHolder.trim() ||
        (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
      isDefault: makeDefault,
    };

    let updatedMethods;
    if (makeDefault) {
      updatedMethods = [
        ...currentMethods.map((m) => ({ ...m, isDefault: false })),
        newEntry,
      ];
    } else {
      updatedMethods = [...currentMethods, newEntry];
    }

    const updatedUser = { ...user, paymentMethods: updatedMethods };
    setUser(updatedUser);
    setShowPaymentModal(false);
    setPaymentData({ methodType: 'JazzCash', title: '', accountNumber: '', accountHolder: '', isDefault: false });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          paymentMethods: updatedMethods,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Payment method saved successfully!');
    } catch {
      showToast('Payment method saved locally.');
    }
  };

  const handleDeletePayment = async (index) => {
    if (!Array.isArray(user?.paymentMethods)) return;

    const updatedMethods = user.paymentMethods.filter((_, i) => i !== index);
    const updatedUser = { ...user, paymentMethods: updatedMethods };
    setUser(updatedUser);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          paymentMethods: updatedMethods,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Payment method removed!');
    } catch {
      showToast('Payment method removed.');
    }
  };

  const handleSetDefaultPayment = async (index) => {
    if (!Array.isArray(user?.paymentMethods)) return;

    const updatedMethods = user.paymentMethods.map((m, i) => ({
      ...m,
      isDefault: i === index,
    }));
    const updatedUser = { ...user, paymentMethods: updatedMethods };
    setUser(updatedUser);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          paymentMethods: updatedMethods,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Default payment method set!');
    } catch {
      showToast('Default payment method updated.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="text-left">
          <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">
            Saved Payment Methods
          </h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">
            Manage your saved wallets, IBAN, and cards for 1-click checkout
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPaymentModal(true)}
          className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Saved Methods List */}
      {!user.paymentMethods || user.paymentMethods.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
          <CreditCard className="w-8 h-8 text-neutral-400" />
          <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">
            No saved payment methods yet
          </p>
          <p className="text-[10px] text-neutral-400 uppercase text-left">
            Save your JazzCash, EasyPaisa, or 1Link IBAN / Debit Card for automatic pre-fill at checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {user.paymentMethods.map((pm, idx) => (
            <div
              key={idx}
              className={`bg-neutral-50 border p-4 rounded-sm space-y-2 relative transition-all text-left ${
                pm.isDefault ? 'border-neutral-900 bg-neutral-50/80 shadow-xs' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between text-left">
                <div className="flex items-center space-x-2 text-left">
                  <span
                    className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-xs text-white ${
                      pm.methodType === 'JazzCash'
                        ? 'bg-red-600'
                        : pm.methodType === 'EasyPaisa'
                        ? 'bg-emerald-600'
                        : pm.methodType === 'BankTransfer'
                        ? 'bg-neutral-900 text-emerald-400'
                        : 'bg-blue-800'
                    }`}
                  >
                    {pm.methodType === 'JazzCash'
                      ? 'JazzCash'
                      : pm.methodType === 'EasyPaisa'
                      ? 'EasyPaisa'
                      : pm.methodType === 'BankTransfer'
                      ? '1LINK / IBAN'
                      : 'Card'}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate text-left">
                    {pm.title || pm.methodType}
                  </p>
                  {pm.isDefault && (
                    <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[8px] font-bold uppercase tracking-wider rounded-xs">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!pm.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultPayment(idx)}
                      className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900 cursor-pointer underline font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePayment(idx)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    title="Remove payment method"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-neutral-800 font-semibold tracking-wider text-left">
                {pm.accountNumber}
              </p>
              {pm.accountHolder && (
                <p className="text-[10px] text-neutral-500 uppercase text-left">
                  Holder: {pm.accountHolder}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supported Gateways Reference */}
      <div className="pt-4 border-t border-neutral-100 space-y-3 text-left">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 text-left">
          Supported Checkout Gateways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center space-x-3 text-left">
            <Smartphone className="w-4 h-4 text-neutral-600 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 text-left">JazzCash & Easypaisa</p>
              <p className="text-[10px] text-neutral-500 text-left">2FA OTP PIN secured mobile deduction</p>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center space-x-3 text-left">
            <Building2 className="w-4 h-4 text-neutral-600 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 text-left">Pakistani Bank & Debit Card</p>
              <p className="text-[10px] text-neutral-500 text-left">1Link IBAN, Meezan, HBL, PayPak cards</p>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center space-x-3 text-left">
            <CreditCard className="w-4 h-4 text-neutral-600 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 text-left">Credit / Debit Card</p>
              <p className="text-[10px] text-neutral-500 text-left">Visa & MasterCard (Stripe 3DS)</p>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center space-x-3 text-left">
            <Package className="w-4 h-4 text-neutral-600 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 text-left">Cash on Delivery (COD)</p>
              <p className="text-[10px] text-neutral-500 text-left">Doorstep payment available nationwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                Add Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  Payment Type *
                </label>
                <select
                  name="methodType"
                  value={paymentData.methodType}
                  onChange={handlePaymentChange}
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                >
                  <option value="JazzCash">JazzCash Mobile Wallet</option>
                  <option value="EasyPaisa">Easypaisa Mobile Wallet</option>
                  <option value="BankTransfer">Pakistani Bank Account / 1Link IBAN / Debit Card</option>
                  <option value="Stripe">Credit / Debit Card (Visa, MasterCard)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  {paymentData.methodType === 'BankTransfer'
                    ? '1Link IBAN or 16-Digit Debit Card Number *'
                    : paymentData.methodType === 'Stripe'
                    ? 'Card Number *'
                    : `${paymentData.methodType} Mobile Number *`}
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  value={paymentData.accountNumber}
                  onChange={handlePaymentChange}
                  placeholder={
                    paymentData.methodType === 'BankTransfer'
                      ? 'e.g. PK92MEZN... or 16-Digit Card Number'
                      : paymentData.methodType === 'Stripe'
                      ? 'e.g. 4242 •••• •••• 4242'
                      : 'e.g. 0300 1234567'
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolder"
                  value={paymentData.accountHolder}
                  onChange={handlePaymentChange}
                  placeholder="e.g. Nabeel Ahmed"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  Account Label / Nickname (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={paymentData.title}
                  onChange={handlePaymentChange}
                  placeholder="e.g. My Primary JazzCash or Salary Account"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="payment-default"
                  name="isDefault"
                  checked={paymentData.isDefault}
                  onChange={handlePaymentChange}
                  className="accent-neutral-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="payment-default" className="text-xs text-neutral-700 cursor-pointer">
                  Set as default payment method
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs flex items-center justify-center text-center"
              >
                Save Payment Method
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

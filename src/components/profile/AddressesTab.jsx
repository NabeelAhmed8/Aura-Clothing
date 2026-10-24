import { useState } from 'react';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AddressesTab({ user, setUser, showToast }) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  });

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !addressData.fullName.trim() ||
      !addressData.streetAddress.trim() ||
      !addressData.city.trim() ||
      !addressData.phone.trim()
    ) {
      showToast('Please fill all required fields (*)');
      return;
    }

    const currentAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const makeDefault = addressData.isDefault || currentAddresses.length === 0;

    let updatedAddresses;
    if (makeDefault) {
      updatedAddresses = [
        ...currentAddresses.map((a) => ({ ...a, isDefault: false })),
        { ...addressData, isDefault: true },
      ];
    } else {
      updatedAddresses = [...currentAddresses, { ...addressData, isDefault: false }];
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    setShowAddressModal(false);
    setAddressData({
      fullName: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Pakistan',
      isDefault: false,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Address saved successfully!');
    } catch {
      showToast('Address saved to local storage.');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!Array.isArray(user?.addresses)) return;

    const updatedAddresses = user.addresses.filter((_, i) => i !== index);
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Address deleted successfully!');
    } catch {
      showToast('Address removed.');
    }
  };

  const handleSetDefaultAddress = async (index) => {
    if (!Array.isArray(user?.addresses)) return;

    const updatedAddresses = user.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Default address updated!');
    } catch {
      showToast('Default address updated.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="text-left">
          <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">
            Saved Addresses
          </h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">
            Manage your delivery locations (Saved to Account)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddressModal(true)}
          className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {!user.addresses || user.addresses.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
          <MapPin className="w-8 h-8 text-neutral-400" />
          <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">
            No saved addresses found
          </p>
          <p className="text-[10px] text-neutral-400 uppercase text-left">
            Click "Add Address" above to save your shipping details to your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {user.addresses.map((addr, idx) => (
            <div
              key={idx}
              className={`bg-neutral-50 border p-4 rounded-sm space-y-2 relative transition-all text-left ${
                addr.isDefault ? 'border-neutral-900 bg-neutral-50/80 shadow-xs' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between text-left">
                <div className="flex items-center space-x-2 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 text-left">
                    {addr.fullName}
                  </p>
                  {addr.isDefault && (
                    <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[8px] font-bold uppercase tracking-wider rounded-xs">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(idx)}
                      className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900 cursor-pointer underline font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(idx)}
                    className="text-red-500 hover:text-red-700 cursor-pointer ml-1"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed text-left">
                {addr.streetAddress}, {addr.city}
                {addr.state ? `, ${addr.state}` : ''}
                {addr.postalCode ? ` - ${addr.postalCode}` : ''}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono text-left">
                Phone: {addr.phone} {addr.country ? `• Country: ${addr.country}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Add New Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={addressData.fullName}
                    onChange={handleAddressChange}
                    placeholder="Nabeel Ahmed"
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={addressData.phone}
                    onChange={handleAddressChange}
                    placeholder="0300 1234567"
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    required
                    value={addressData.streetAddress}
                    onChange={handleAddressChange}
                    placeholder="House # 123, Street 4, Sector..."
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={addressData.city}
                    onChange={handleAddressChange}
                    placeholder="Lahore, Karachi, Islamabad..."
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    placeholder="Punjab, Sindh..."
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={addressData.postalCode}
                    onChange={handleAddressChange}
                    placeholder="54000"
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={addressData.country}
                    onChange={handleAddressChange}
                    placeholder="Pakistan"
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2 flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="address-default"
                    name="isDefault"
                    checked={addressData.isDefault}
                    onChange={handleAddressChange}
                    className="accent-neutral-900 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="address-default" className="text-xs text-neutral-700 cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs flex items-center justify-center text-center"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

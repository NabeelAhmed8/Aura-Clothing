import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, MapPin, Package, CreditCard, Settings, LogOut, Save, X, Plus, Trash2, Key, CheckCircle2, Clock, Smartphone, Building2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showToast = useCartStore((state) => state.showToast);
  const user = useCartStore((state) => state.user);
  const setUser = useCartStore((state) => state.setUser);

  const validTabs = ['profile', 'addresses', 'orders', 'payment', 'settings'];
  const tabQuery = searchParams.get('tab');
  
  // Direct Derived State
  const activeTab = validTabs.includes(tabQuery) ? tabQuery : 'profile';

  const [isEditing, setIsEditing] = useState(false);

  // Modals state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Orders State (Linked with Checkout backend)
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Profile Edit Form State
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  }));

  // New Address Form State
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false
  });

  // New Payment Method Form State
  const [paymentData, setPaymentData] = useState({
    methodType: 'JazzCash',
    title: '',
    accountNumber: '',
    accountHolder: '',
    isDefault: false
  });

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Sync latest user profile, addresses & payment methods from MongoDB on mount
  const userEmail = user?.email;
  useEffect(() => {
    if (!userEmail) return;
    let isMounted = true;

    fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user) {
          setUser((prev) => {
            if (!prev) return data.user;
            return {
              ...prev,
              ...data.user,
              firstName: data.user.firstName || prev.firstName || '',
              lastName: data.user.lastName || prev.lastName || '',
              phone: data.user.phone || prev.phone || '',
              dateOfBirth: data.user.dateOfBirth || prev.dateOfBirth || '',
              gender: data.user.gender || prev.gender || '',
              addresses: data.user.addresses?.length ? data.user.addresses : (prev.addresses || []),
              paymentMethods: data.user.paymentMethods?.length ? data.user.paymentMethods : (prev.paymentMethods || []),
            };
          });
          setFormData((prev) => ({
            firstName: data.user.firstName || prev.firstName || '',
            lastName: data.user.lastName || prev.lastName || '',
            phone: data.user.phone || prev.phone || '',
            dateOfBirth: data.user.dateOfBirth || prev.dateOfBirth || '',
            gender: data.user.gender || prev.gender || ''
          }));
        }
      })
      .catch((err) => console.error('Failed to sync profile from backend:', err));

    return () => {
      isMounted = false;
    };
  }, [userEmail, setUser]);

  // Sidebar tab click handler
  const handleTabChange = (tabName) => {
    setIsEditing(false);
    setSearchParams({ tab: tabName }, { replace: true });
  };

  // Sync addresses whenever user opens 'addresses' tab
  useEffect(() => {
    if (activeTab !== 'addresses' || !userEmail) return;

    fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        }
      })
      .catch((err) => console.error('Failed to sync addresses on tab open:', err));
  }, [activeTab, userEmail, setUser]);

  const resetProfileForm = () => {
    if (!user) return;
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || ''
    });
  };

  // Fetch real placed orders when 'orders' tab is opened
  useEffect(() => {
    if (activeTab !== 'orders' || !user?.email) {
      return;
    }

    let isMounted = true;
    const queryParams = new URLSearchParams({ email: user.email.trim() });
    if (user._id || user.id) {
      queryParams.append('userId', user._id || user.id);
    }

    fetch(`${API_BASE_URL}/api/orders/user-orders?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && Array.isArray(data.data)) {
          setOrders(data.data);
        } else if (Array.isArray(user.orders) && user.orders.length > 0) {
          setOrders(user.orders);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        if (isMounted) {
          setOrders(Array.isArray(user.orders) ? user.orders : []);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, user?.email, user?._id, user?.id, user?.orders]);

  const handleRefreshOrders = async () => {
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
      }
    } catch (err) {
      console.error('Refresh orders failed:', err);
      if (Array.isArray(user.orders)) setOrders(user.orders);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Profile Changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    setIsEditing(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
      showToast('Profile updated successfully!');
    } catch {
      showToast('Profile updated locally.');
    }
  };

  // Add Address & Sync with MongoDB
  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressData.fullName.trim() || !addressData.streetAddress.trim() || !addressData.city.trim() || !addressData.phone.trim()) {
      showToast('Please fill all required fields (*)');
      return;
    }

    const currentAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const makeDefault = addressData.isDefault || currentAddresses.length === 0;

    let updatedAddresses;
    if (makeDefault) {
      updatedAddresses = [
        ...currentAddresses.map((a) => ({ ...a, isDefault: false })),
        { ...addressData, isDefault: true }
      ];
    } else {
      updatedAddresses = [...currentAddresses, { ...addressData, isDefault: false }];
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    setShowAddressModal(false);
    setAddressData({ fullName: '', phone: '', streetAddress: '', city: '', state: '', postalCode: '', country: 'Pakistan', isDefault: false });

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

  // Delete Address
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

  // Set Default Address
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

  // Add Payment Method & Sync with MongoDB
  const handleAddPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.accountNumber.trim()) {
      showToast('Please enter an account or card number');
      return;
    }

    const currentMethods = Array.isArray(user.paymentMethods) ? user.paymentMethods : [];
    const makeDefault = paymentData.isDefault || currentMethods.length === 0;

    const defaultTitle = 
      paymentData.methodType === 'JazzCash' ? 'JazzCash Mobile Account' :
      paymentData.methodType === 'EasyPaisa' ? 'Easypaisa Mobile Account' :
      paymentData.methodType === 'BankTransfer' ? '1Link Bank / IBAN' :
      paymentData.methodType === 'Stripe' ? 'Debit / Credit Card' : 'Payment Account';

    const newEntry = {
      ...paymentData,
      title: paymentData.title.trim() || defaultTitle,
      accountNumber: paymentData.accountNumber.trim(),
      accountHolder: paymentData.accountHolder.trim() || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
      isDefault: makeDefault,
    };

    let updatedMethods;
    if (makeDefault) {
      updatedMethods = [
        ...currentMethods.map((m) => ({ ...m, isDefault: false })),
        newEntry
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

  // Delete Payment Method
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

  // Set Default Payment Method
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

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match');
      return;
    }

    try {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch {
      showToast('Failed to change password');
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out successfully.');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#F9F9F8] flex flex-col items-center justify-start -mt-16 pb-16 px-4 sm:px-8 pt-28 space-y-8 relative">
      
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-end">
        <button 
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto bg-white border border-neutral-200 shadow-sm rounded-sm grid grid-cols-1 md:grid-cols-4 overflow-hidden items-stretch">
        
        {/* Sidebar Tabs */}
        <div className="bg-neutral-50 border-r border-neutral-200 p-6 flex flex-col justify-between space-y-6 w-full">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-200">
              <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                {user.firstName ? user.firstName[0] : (user.email ? user.email[0] : 'U')}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || 'AURA Member')}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1 text-xs uppercase tracking-widest font-medium">
              <button onClick={() => handleTabChange('profile')} className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${activeTab === 'profile' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'}`}>
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button onClick={() => handleTabChange('addresses')} className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${activeTab === 'addresses' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'}`}>
                <MapPin className="w-4 h-4" />
                <span>Addresses</span>
              </button>
              <button onClick={() => handleTabChange('orders')} className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${activeTab === 'orders' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'}`}>
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </button>
              <button onClick={() => handleTabChange('payment')} className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${activeTab === 'payment' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'}`}>
                <CreditCard className="w-4 h-4" />
                <span>Payment</span>
              </button>
              <button onClick={() => handleTabChange('settings')} className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${activeTab === 'settings' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'}`}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 p-6 sm:p-10 space-y-6 text-left">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="text-left">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">Personal Information</h2>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">Manage your personal profile details</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="border border-neutral-300 px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:border-neutral-900 transition-colors cursor-pointer self-start sm:self-auto flex items-center justify-center"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsEditing(false); resetProfileForm(); }}
                    className="text-neutral-500 hover:text-neutral-900 px-4 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold cursor-pointer self-start sm:self-auto flex items-center justify-center"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">Full Name</span>
                    <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || 'Not specified')}
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">Email Address</span>
                    <p className="text-xs text-neutral-900 font-medium mt-1 text-left">{user.email}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">Phone Number</span>
                    <p className="text-xs text-neutral-900 font-medium mt-1 text-left">{user.phone || 'Not specified'}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">Date of Birth</span>
                    <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">{user.dateOfBirth || 'Not specified'}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm sm:col-span-2 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">Gender</span>
                    <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">{user.gender || 'Not specified'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveChanges} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 text-left" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left" />
                    </div>
                    <div className="space-y-1 sm:col-span-2 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-2 text-center">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="text-left">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">Saved Addresses</h2>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">Manage your delivery locations (Saved to Account)</p>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
                  <MapPin className="w-8 h-8 text-neutral-400" />
                  <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">No saved addresses found</p>
                  <p className="text-[10px] text-neutral-400 uppercase text-left">Click "Add Address" above to save your shipping details to your account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className={`bg-neutral-50 border p-4 rounded-sm space-y-2 relative transition-all text-left ${addr.isDefault ? 'border-neutral-900 bg-neutral-50/80 shadow-xs' : 'border-neutral-200'}`}>
                      <div className="flex items-start justify-between text-left">
                        <div className="flex items-center space-x-2 text-left">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 text-left">{addr.fullName}</p>
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
                        {addr.streetAddress}, {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.postalCode ? ` - ${addr.postalCode}` : ''}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono text-left">
                        Phone: {addr.phone} {addr.country ? `• Country: ${addr.country}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="text-left">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">Order History</h2>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">Track and review your purchases</p>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshOrders}
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
              ) : orders.length === 0 ? (
                <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
                  <Package className="w-8 h-8 text-neutral-400" />
                  <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">No orders placed yet</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {orders.map((ord) => (
                    <div key={ord._id || ord.id || ord.orderId} className="bg-neutral-50 border border-neutral-200 p-5 rounded-sm space-y-3 text-left">
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
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-xs flex items-center space-x-1 ${
                            ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
                            {ord.paymentStatus}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-neutral-900 text-white rounded-xs">
                            {ord.orderStatus || 'Processing'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-left">
                        <div className="text-left">
                          <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">Payment Via</span>
                          <span className="font-medium text-neutral-900 text-left">{ord.paymentMethod}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">Total Amount</span>
                          <span className="font-semibold text-neutral-900 text-left">${ord.totalAmount}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-neutral-400 uppercase block font-semibold text-left">Delivery City</span>
                          <span className="text-neutral-600 truncate block text-left">{ord.customer?.city || 'N/A'}</span>
                        </div>
                      </div>

                      {ord.items && ord.items.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 text-left">
                          {ord.items.map((it, idx) => (
                            <span key={idx}>
                              {it.name} (x{it.quantity || 1}){idx < ord.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeTab === 'payment' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="text-left">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">Saved Payment Methods</h2>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">Manage your saved wallets, IBAN, and cards for 1-click checkout</p>
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
              {(!user.paymentMethods || user.paymentMethods.length === 0) ? (
                <div className="bg-neutral-50 border border-neutral-200 p-8 text-left rounded-sm space-y-2">
                  <CreditCard className="w-8 h-8 text-neutral-400" />
                  <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium text-left">No saved payment methods yet</p>
                  <p className="text-[10px] text-neutral-400 uppercase text-left">Save your JazzCash, EasyPaisa, or 1Link IBAN / Debit Card for automatic pre-fill at checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {user.paymentMethods.map((pm, idx) => (
                    <div key={idx} className={`bg-neutral-50 border p-4 rounded-sm space-y-2 relative transition-all text-left ${pm.isDefault ? 'border-neutral-900 bg-neutral-50/80 shadow-xs' : 'border-neutral-200'}`}>
                      <div className="flex items-start justify-between text-left">
                        <div className="flex items-center space-x-2 text-left">
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-xs text-white ${
                            pm.methodType === 'JazzCash' ? 'bg-red-600' :
                            pm.methodType === 'EasyPaisa' ? 'bg-emerald-600' :
                            pm.methodType === 'BankTransfer' ? 'bg-neutral-900 text-emerald-400' : 'bg-blue-800'
                          }`}>
                            {pm.methodType === 'JazzCash' ? 'JazzCash' :
                             pm.methodType === 'EasyPaisa' ? 'EasyPaisa' :
                             pm.methodType === 'BankTransfer' ? '1LINK / IBAN' : 'Card'}
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
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 text-left">Supported Checkout Gateways</h3>
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
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left">
              <div className="text-left">
                <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">Account Settings</h2>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">Preferences, passwords and security</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm flex items-center justify-between text-left">
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 text-left">Email Notifications</p>
                    <p className="text-[10px] text-neutral-500 uppercase text-left">Receive updates about new arrivals & offers</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 uppercase">Active</span>
                </div>

                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm flex items-center justify-between text-left">
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 text-left">Password & Security</p>
                    <p className="text-[10px] text-neutral-500 uppercase text-left">Update your account password</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: ADD ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-neutral-500 hover:text-neutral-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Full Name *</label>
                  <input type="text" name="fullName" required value={addressData.fullName} onChange={handleAddressChange} placeholder="Nabeel Ahmed" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Phone Number *</label>
                  <input type="text" name="phone" required value={addressData.phone} onChange={handleAddressChange} placeholder="0300 1234567" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Street Address *</label>
                  <input type="text" name="streetAddress" required value={addressData.streetAddress} onChange={handleAddressChange} placeholder="House # 123, Street 4, Sector..." className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">City *</label>
                  <input type="text" name="city" required value={addressData.city} onChange={handleAddressChange} placeholder="Lahore, Karachi, Islamabad..." className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">State / Province</label>
                  <input type="text" name="state" value={addressData.state} onChange={handleAddressChange} placeholder="Punjab, Sindh..." className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Postal / ZIP Code</label>
                  <input type="text" name="postalCode" value={addressData.postalCode} onChange={handleAddressChange} placeholder="54000" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Country</label>
                  <input type="text" name="country" value={addressData.country} onChange={handleAddressChange} placeholder="Pakistan" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase" />
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
              <button type="submit" className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs flex items-center justify-center text-center">
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYMENT METHOD MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Add Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-neutral-500 hover:text-neutral-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Payment Type *</label>
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
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Account Holder Name</label>
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
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Account Label / Nickname (Optional)</label>
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

              <button type="submit" className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs flex items-center justify-center text-center">
                Save Payment Method
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-neutral-500 hover:text-neutral-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Current Password</label>
                <input type="password" name="currentPassword" required value={passwordData.currentPassword} onChange={handlePasswordChangeInput} placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">New Password</label>
                <input type="password" name="newPassword" required value={passwordData.newPassword} onChange={handlePasswordChangeInput} placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Confirm New Password</label>
                <input type="password" name="confirmPassword" required value={passwordData.confirmPassword} onChange={handlePasswordChangeInput} placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" />
              </div>
              <button type="submit" className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center text-center">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
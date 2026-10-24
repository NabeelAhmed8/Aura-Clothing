import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, MapPin, Package, CreditCard, Settings, LogOut } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

import ProfileInfoTab from '../components/profile/ProfileInfoTab';
import AddressesTab from '../components/profile/AddressesTab';
import OrdersTab from '../components/profile/OrdersTab';
import PaymentTab from '../components/profile/PaymentTab';
import SettingsTab from '../components/profile/SettingsTab';

const VALID_TABS = ['profile', 'addresses', 'orders', 'payment', 'settings'];

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showToast = useCartStore((state) => state.showToast);
  const user = useCartStore((state) => state.user);
  const setUser = useCartStore((state) => state.setUser);

  const tabQuery = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabQuery) ? tabQuery : 'profile';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Sync latest user profile on mount
  const userEmail = user?.email;
  useEffect(() => {
    if (!userEmail) return;
    let isMounted = true;

    fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user) {
          setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        }
      })
      .catch((err) => console.error('Failed to sync profile from backend:', err));

    return () => {
      isMounted = false;
    };
  }, [userEmail, setUser]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName }, { replace: true });
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
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-200 text-left">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user.firstName ? user.firstName[0] : user.email ? user.email[0] : 'U'}
                </div>
              )}
              <div className="overflow-hidden text-left flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate text-left">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || 'AURA Member'}
                </p>
                <p className="text-[10px] text-neutral-500 truncate text-left">{user.email}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1 text-xs uppercase tracking-widest font-medium">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-sm transition-colors text-left cursor-pointer ${
                      isActive ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 p-6 sm:p-10 space-y-6 text-left">
          {activeTab === 'profile' && (
            <ProfileInfoTab key={user?.email || 'user'} user={user} setUser={setUser} showToast={showToast} />
          )}

          {activeTab === 'addresses' && (
            <AddressesTab user={user} setUser={setUser} showToast={showToast} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab user={user} />
          )}

          {activeTab === 'payment' && (
            <PaymentTab user={user} setUser={setUser} showToast={showToast} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab user={user} showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Key, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function SettingsTab({ user, showToast }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      showToast('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password updated successfully in database!');
      } else {
        showToast(data.error || data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      showToast('Server connection error. Please ensure backend is running.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="text-left">
        <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">
          Account Settings
        </h2>
        <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">
          Preferences, passwords and security
        </p>
      </div>

      <div className="space-y-4 text-left">
        <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm flex items-center justify-between text-left">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 text-left">
              Email Notifications
            </p>
            <p className="text-[10px] text-neutral-500 uppercase text-left">
              Receive updates about new arrivals & offers
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase">Active</span>
        </div>

        <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm flex items-center justify-between text-left">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 text-left">
              Password & Security
            </p>
            <p className="text-[10px] text-neutral-500 uppercase text-left">
              Update your account password
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="bg-neutral-900 text-white px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-sm shadow-xl space-y-6 relative animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

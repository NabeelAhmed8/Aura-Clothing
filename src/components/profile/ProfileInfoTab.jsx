import { useState } from 'react';
import { Save } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ProfileInfoTab({ user, setUser, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
      });
    }
    setIsEditing(false);
  };

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

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="text-left">
          <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 text-left">
            Personal Information
          </h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1 text-left">
            Manage your personal profile details
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="border border-neutral-300 px-4 sm:px-5 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:border-neutral-900 transition-colors cursor-pointer self-start sm:self-auto flex items-center justify-center"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={resetForm}
            className="text-neutral-500 hover:text-neutral-900 px-4 py-2.5 min-h-9.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold cursor-pointer self-start sm:self-auto flex items-center justify-center"
          >
            Cancel
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">
              Full Name
            </span>
            <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">
              {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || 'Not specified'}
            </p>
          </div>
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">
              Email Address
            </span>
            <p className="text-xs text-neutral-900 font-medium mt-1 text-left">{user.email}</p>
          </div>
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">
              Phone Number
            </span>
            <p className="text-xs text-neutral-900 font-medium mt-1 text-left">{user.phone || 'Not specified'}</p>
          </div>
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm text-left">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">
              Date of Birth
            </span>
            <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">
              {user.dateOfBirth || 'Not specified'}
            </p>
          </div>
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm sm:col-span-2 text-left">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block text-left">
              Gender
            </span>
            <p className="text-xs text-neutral-900 uppercase font-medium mt-1 text-left">
              {user.gender || 'Not specified'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveChanges} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 text-left"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left"
              />
            </div>
            <div className="space-y-1 sm:col-span-2 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium text-left block">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase text-left"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center space-x-2 text-center"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      )}
    </div>
  );
}

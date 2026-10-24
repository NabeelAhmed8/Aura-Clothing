import OtpVerificationCard from '../components/auth/OtpVerificationCard';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';
  const emailParam = searchParams.get('email') || '';
  const reasonParam = searchParams.get('reason');
  const isAccountRequired = searchParams.get('message') === 'login_required' || redirectPath === '/checkout' || reasonParam === 'new_user';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccessRegistered, setIsSuccessRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: emailParam || '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          firstName: (data.firstName || '').trim(),
          lastName: (data.lastName || '').trim(),
          name: `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          phone: (data.phone || '').trim(),
          dateOfBirth: data.dateOfBirth || undefined,
          gender: data.gender || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed');
      }

      if (result.verificationRequired || result.requiresVerification) {
        setRegisteredEmail(data.email.trim().toLowerCase());
        setIsSuccessRegistered(true);
        showToast('Verification code sent to your email.');
        return;
      }

      setUser({
        id: result.user?.id || result.user?._id,
        email: result.user?.email || data.email,
        name: result.user?.name || `${data.firstName} ${data.lastName}`,
        firstName: result.user?.firstName || data.firstName,
        lastName: result.user?.lastName || data.lastName,
        phone: result.user?.phone || data.phone || '',
        gender: result.user?.gender || data.gender || '',
        token: result.token,
      });

      showToast('Account created successfully! Welcome to AURA.');
      navigate(redirectPath);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F9F9F8] flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6">
      {isSuccessRegistered ? (
        <OtpVerificationCard
          email={registeredEmail}
          title="Verify Your Account"
          subtitle="We have sent a 6-digit verification code to:"
          backLabel="← Back to Sign In"
          onBack={() => navigate('/login')}
          onSuccess={(verifiedUser, token) => {
            if (verifiedUser) {
              setUser({ ...verifiedUser, token });
            }
            showToast('Account verified successfully! Welcome to AURA.');
            navigate(redirectPath || '/profile');
          }}
        />
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-5 sm:p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-left">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Create a new account</p>
          </div>

          {/* Account Required Notice */}
          {isAccountRequired && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xs flex items-start space-x-3 text-left animate-fade-in shadow-2xs">
              <div className="p-1.5 bg-amber-100 text-amber-900 rounded-2xs shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-amber-800" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {reasonParam === 'new_user' ? 'New Customer Account' : 'Account Required'}
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Please complete your registration to proceed with checkout.
                </p>
              </div>
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-sm text-center uppercase tracking-wider">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left w-full">
            {/* First Name & Last Name (Stacked on mobile, 2 columns on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="space-y-1 text-left">
                <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  autoComplete="given-name"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="e.g. Sarah"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
                />
                {errors.firstName && <p className="text-[10px] text-red-600 mt-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  autoComplete="family-name"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="e.g. Jenkins"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
                />
                {errors.lastName && <p className="text-[10px] text-red-600 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1 text-left">
              <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Email Address *
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="name@example.com"
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
              />
              {errors.email && <p className="text-[10px] text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1 text-left">
              <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                placeholder="0300 1234567"
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
              />
            </div>

            {/* Date of Birth & Gender (Stacked on mobile, 2 columns on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="space-y-1 text-left">
                <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  autoComplete="bday"
                  {...register('dateOfBirth')}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Other">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 text-left relative">
              <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Password * (Min 10 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 10,
                      message: 'Password must be at least 10 characters long',
                    },
                  })}
                  placeholder="••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 pr-10 rounded-xs text-left"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left relative">
              <label className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  placeholder="••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 pr-10 rounded-xs text-left"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-600 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center rounded-xs mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {/* Bottom Switch to Sign In */}
      <div className="w-full max-w-md mx-auto text-center pt-4 border-t border-neutral-200 mt-4">
        <p className="text-xs text-neutral-600">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`}
            className="text-neutral-900 font-bold hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest mt-2">
        &copy; 2026 AURA | Independent Luxury Studio. All rights reserved.
      </div>
    </div>
  );
}

import OtpVerificationCard from '../components/auth/OtpVerificationCard';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';
  const emailParam = searchParams.get('email') || '';
  const reasonParam = searchParams.get('reason');
  const isAccountRequired = searchParams.get('message') === 'login_required' || redirectPath === '/checkout' || reasonParam === 'new_user';

  const [serverError, setServerError] = useState('');
  const [isSuccessRegistered, setIsSuccessRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: emailParam,
    },
  });
  const password = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (data) => {
    setServerError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          password: data.password,
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed');
      }

      if (result.requiresVerification) {
        setIsSuccessRegistered(true);
        setRegisteredEmail(data.email);
        showToast('Registration successful! Please enter the 6-digit code sent to your email.');
        return;
      }

      const userProfileData = {
        ...(result.user || {}),
        firstName: result.user?.firstName || data.firstName || '',
        lastName: result.user?.lastName || data.lastName || '',
        email: result.user?.email || data.email || '',
        phone: result.user?.phone || data.phone || '',
        dateOfBirth: result.user?.dateOfBirth || data.dateOfBirth || '',
        gender: result.user?.gender || data.gender || '',
        addresses: result.user?.addresses || [],
        paymentMethods: result.user?.paymentMethods || [],
      };

      setUser(userProfileData);

      showToast('Account created successfully! Welcome to AURA.');
      navigate(redirectPath);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F8] flex flex-col justify-start mt-4 pb-12 px-6 space-y-3">
      <div className="w-full max-w-md mx-auto">
        <Link
          to="/"
          aria-label="Back to Home"
          title="Back to Home"
          className="inline-flex items-center text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {isSuccessRegistered ? (
        <OtpVerificationCard
          email={registeredEmail}
          title="Verify Your Account"
          subtitle="We have sent a 6-digit verification code to:"
          backLabel="← Back to Sign In"
          onBack={() => navigate('/login')}
          onSuccess={() => {
            showToast('Account verified successfully! Welcome to AURA.');
            navigate(redirectPath);
          }}
        />
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">First Name *</label>
                <input
                  type="text"
                  autoComplete="given-name"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="e.g. Sarah"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
                {errors.firstName && <p className="text-[10px] text-red-600">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Last Name *</label>
                <input
                  type="text"
                  autoComplete="family-name"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="e.g. Jenkins"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
                {errors.lastName && <p className="text-[10px] text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Email Address *</label>
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
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
              />
              {errors.email && <p className="text-[10px] text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Phone Number (Optional)</label>
              <input
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                placeholder="0300 1234567"
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Date of Birth</label>
                <input
                  type="date"
                  autoComplete="bday"
                  {...register('dateOfBirth')}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Other">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Password * (Min 10 characters)</label>
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
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  placeholder="••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 pr-10"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      <div className="text-center pt-4 border-t border-neutral-100 mt-2">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`}
            className="text-neutral-900 font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest">
        &copy; 2026 AURA | Independent Luxury Studio. All rights reserved.
      </div>
    </div>
  );
}

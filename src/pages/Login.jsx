import OtpVerificationCard from '../components/auth/OtpVerificationCard';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchema';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';
  const emailParam = searchParams.get('email') || '';
  const reasonParam = searchParams.get('reason');
  const isLoginRequired = searchParams.get('message') === 'login_required' || redirectPath === '/checkout' || reasonParam === 'registered';

  const [serverError, setServerError] = useState('');
  const [loginLinkSent, setLoginLinkSent] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.requiresVerification || result.verificationRequired) {
        setLoginLinkSent(true);
        setLoginEmail(data.email);
        if (result.debugOtp) {
          setDebugOtp(result.debugOtp);
          showToast(`Sign-in code: ${result.debugOtp}`);
        } else {
          showToast('A 6-digit sign-in code has been sent to your email.');
        }
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Invalid email or password');
      }

      const userProfileData = result.user || {
        firstName: result.firstName || 'User',
        lastName: result.lastName || '',
        email: data.email,
        phone: result.phone || '',
        dateOfBirth: result.dateOfBirth || '',
        gender: result.gender || '',
        addresses: result.addresses || []
      };

      setUser(userProfileData);

      showToast('Login successful! Welcome back.');
      navigate(redirectPath);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F9F9F8] flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6">
      {loginLinkSent ? (
        <OtpVerificationCard
          email={loginEmail}
          initialOtp={debugOtp}
          title="Sign-In Verification"
          subtitle="We have sent a 6-digit sign-in code to:"
          backLabel="← Try another email"
          onBack={() => setLoginLinkSent(false)}
          onSuccess={(verifiedUser, token) => {
            if (verifiedUser) {
              setUser({ ...verifiedUser, token });
            }
            showToast('Login successful! Welcome back.');
            navigate(redirectPath || '/profile');
          }}
        />
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-5 sm:p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-left">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Sign in to your account</p>
          </div>

          {/* Login Required Notice */}
          {isLoginRequired && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xs flex items-start space-x-3 text-left animate-fade-in shadow-2xs">
              <div className="p-1.5 bg-amber-100 text-amber-900 rounded-2xs shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-amber-800" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {reasonParam === 'registered' ? 'Welcome Back!' : 'Login Required'}
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {reasonParam === 'registered'
                    ? 'An existing account was found for your email. Please enter your password to proceed to checkout.'
                    : 'Please sign in to proceed with your checkout. Your selected cart items are saved and ready.'}
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
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="name@example.com"
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
              />
              {errors.email && <p className="text-[10px] text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1 text-left relative">
              <label htmlFor="password" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center rounded-xs mt-2"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      )}

      <div className="w-full max-w-md mx-auto text-center pt-4 border-t border-neutral-200 mt-4">
        <p className="text-xs text-neutral-600">
          Don't have an account?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectPath)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`}
            className="text-neutral-900 font-bold hover:underline ml-1"
          >
            Create Account
          </Link>
        </p>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest mt-2">
        &copy; 2026 AURA | Independent Luxury Studio. All rights reserved.
      </div>
    </div>
  );
}

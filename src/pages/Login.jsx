import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchema';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loginLinkSent, setLoginLinkSent] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
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

      if (result.requiresVerification) {
        setLoginLinkSent(true);
        setLoginEmail(data.email);
        showToast('A sign-in link has been sent to your email.');
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
      navigate('/profile');
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F8] flex flex-col justify-start mt-4 pb-4 px-6 space-y-3">

      {loginLinkSent ? (
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-widest text-neutral-900 uppercase">Sign-In Link Sent</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              A secure sign-in verification link has been sent to:
            </p>
            <p className="text-xs font-mono font-bold text-neutral-900 bg-neutral-50 py-1.5 px-3 rounded-xs border border-neutral-200 inline-block">
              {loginEmail}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm text-left space-y-2 text-xs text-neutral-600">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px]">How to complete your sign-in:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed text-neutral-700">
              <li>Open your email inbox (please check your Spam/Junk folder if not found).</li>
              <li>Click the <strong>"Verify & Sign In"</strong> link.</li>
              <li>You will be authenticated and redirected directly to your account.</li>
            </ol>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setLoginLinkSent(false)}
              className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] font-bold cursor-pointer"
            >
              &larr; Try another email
            </button>
            <Link
              to={`/verify-email?email=${encodeURIComponent(loginEmail)}`}
              className="text-neutral-900 font-bold uppercase tracking-wider text-[10px] hover:underline"
            >
              Resend link
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Sign in to your account</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-sm text-center uppercase tracking-wider">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-neutral-700 font-medium">
              Email Address
            </label>
            <input 
              id="email"
              name="email"
              type="email" 
              autoComplete="email"
              {...register('email')} 
              placeholder="name@example.com" 
              className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" 
            />
            {errors.email && <p className="text-[10px] text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1 relative">
            <label htmlFor="password" className="text-xs uppercase tracking-widest text-neutral-700 font-medium">
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
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 pr-10" 
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

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
      )}

      <div className="text-center pt-4 border-t border-neutral-100 mt-4">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Don't have an account?{' '}
          <Link to="/register" className="text-neutral-900 font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest">
        &copy; 2026 AURA | Independent Luxury Studio. All rights reserved.
      </div>
    </div>
  );
}
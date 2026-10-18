import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSuccessRegistered, setIsSuccessRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm();
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
          ...data,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed');
      }

      if (result.requiresVerification) {
        setIsSuccessRegistered(true);
        setRegisteredEmail(data.email);
        showToast('A verification link has been sent to your email.');
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
      navigate('/profile');
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
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-widest text-neutral-900 uppercase">Verify Your Email</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              A verification link has been sent to your email address:
            </p>
            <p className="text-xs font-mono font-bold text-neutral-900 bg-neutral-50 py-1.5 px-3 rounded-xs border border-neutral-200 inline-block">
              {registeredEmail}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm text-left space-y-2 text-xs text-neutral-600">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px]">Next Steps:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed text-neutral-700">
              <li>Open your email inbox (please check your Spam/Junk folder if not found).</li>
              <li>Click the <strong>"Verify Account & Login"</strong> button.</li>
              <li>Your account will be verified and you will be signed in automatically.</li>
            </ol>
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <Link
              to="/login"
              className="w-full bg-neutral-900 text-white py-3.5 px-6 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Create a new account</p>
          </div>

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
                {...register('firstName', { required: 'First name is required' })} 
                placeholder="John" 
                className={`w-full bg-neutral-50 border px-3 py-2.5 text-xs text-neutral-950 focus:outline-none uppercase ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
              />
              {errors.firstName && <p className="text-[9px] text-red-600">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Last Name *</label>
              <input 
                type="text" 
                {...register('lastName', { required: 'Last name is required' })} 
                placeholder="Doe" 
                className={`w-full bg-neutral-50 border px-3 py-2.5 text-xs text-neutral-950 focus:outline-none uppercase ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
              />
              {errors.lastName && <p className="text-[9px] text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Email Address *</label>
            <input 
              type="email" 
              autoComplete="email"
              {...register('email', { required: 'Email address is required' })} 
              placeholder="name@example.com" 
              className={`w-full bg-neutral-50 border px-4 py-3 text-xs text-neutral-950 focus:outline-none ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
            />
            {errors.email && <p className="text-[10px] text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] uppercase tracking-widest text-neutral-700 font-medium">Password *</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                autoComplete="new-password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters required' } })} 
                placeholder="••••••••" 
                className={`w-full bg-neutral-50 border px-4 py-3 text-xs text-neutral-950 focus:outline-none pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
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
                  validate: value => value === password || 'Passwords do not match' 
                })} 
                placeholder="••••••••" 
                className={`w-full bg-neutral-50 border px-4 py-3 text-xs text-neutral-950 focus:outline-none pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <hr className="border-neutral-200 my-2" />

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Phone Number (Optional)</label>
            <input 
              type="text" 
              {...register('phone')} 
              placeholder="+92 300 1234567" 
              className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Date of Birth (Opt)</label>
              <input 
                type="date" 
                {...register('dateOfBirth')} 
                className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Gender (Opt)</label>
              <select 
                {...register('gender')} 
                className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 uppercase"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center text-center"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
      )}

      <div className="text-center pt-4 border-t border-neutral-100 mt-2">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Already have an account?{' '}
          <Link to="/login" className="text-neutral-900 font-bold hover:underline">
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
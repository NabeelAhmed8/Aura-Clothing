import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, useWatch } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Single Responsibility: Handles registration input fields, password visibility toggles,
 * client-side validations, and form submission.
 */
export default function RegisterForm({ defaultEmail = '', onSubmit, isSubmitting = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: defaultEmail,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left w-full">
      {/* First Name & Last Name */}
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

      {/* Date of Birth & Gender */}
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
            <option value="Prefer not to say">Prefer not to say</option>
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
  );
}

RegisterForm.propTypes = {
  defaultEmail: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

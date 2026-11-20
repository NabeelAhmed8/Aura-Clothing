import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useCartStore } from '../../store/useCartStore';

export default function ForgotPasswordCard({
  initialEmail = '',
  onSuccess,
  onBack,
}) {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [noticeMessage, setNoticeMessage] = useState('');

  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const showToast = useCartStore((state) => state.showToast);

  useEffect(() => {
    if (step === 'request') {
      emailInputRef.current?.focus();
    } else {
      otpInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNoticeMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send recovery code.');
      }

      setNoticeMessage(`A 6-digit recovery code was sent to ${cleanEmail}.`);
      showToast('Recovery code sent to your email.');
      setStep('reset');
      setResendCountdown(30);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setErrorMessage('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to resend code.');
      }

      setNoticeMessage('A fresh recovery code has been sent to your email.');
      showToast('New code sent to your email.');
      setResendCountdown(30);
    } catch (err) {
      setErrorMessage(err.message || 'Could not resend recovery code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and retype.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to reset password.');
      }

      showToast('Password reset successful! Please sign in.');
      if (onSuccess) {
        onSuccess(cleanEmail);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-5 sm:p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-left">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
          {step === 'request' ? 'Reset your password' : 'Create new password'}
        </p>
        <p className="text-xs text-neutral-600 leading-relaxed text-center w-full">
          {step === 'request'
            ? 'Enter your registered email address to receive a 6-digit recovery code.'
            : 'Enter the 6-digit verification code sent to your email to set your new password.'}
        </p>
        {step === 'reset' && email && (
          <div className="pt-1">
            <span className="text-xs font-mono font-medium text-neutral-800 bg-neutral-100 py-1 px-3 rounded-xs border border-neutral-200 inline-block">
              {email}
            </span>
          </div>
        )}
      </div>

      {noticeMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-sm text-center uppercase tracking-wider">
          {noticeMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-sm text-center uppercase tracking-wider">
          {errorMessage}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4 text-left w-full">
          <div className="space-y-1 text-left">
            <label htmlFor="recovery-email" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
              Email Address
            </label>
            <input
              ref={emailInputRef}
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              placeholder="name@example.com"
              required
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs text-left"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center rounded-xs mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Code...
              </span>
            ) : (
              'Send Recovery Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4 text-left w-full">
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="reset-otp" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium">
                6-Digit Recovery Code
              </label>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || isLoading}
                className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900 disabled:opacity-50 cursor-pointer font-medium"
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
              </button>
            </div>
            <input
              ref={otpInputRef}
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setErrorMessage('');
              }}
              placeholder="······"
              required
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-center text-base sm:text-lg font-mono tracking-[0.4em] font-bold text-neutral-950 focus:outline-none focus:border-neutral-900 rounded-xs"
            />
          </div>

          <div className="space-y-1 text-left relative">
            <label htmlFor="new-password" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••"
                required
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
          </div>

          <div className="space-y-1 text-left relative">
            <label htmlFor="confirm-password" className="block text-left text-[11px] sm:text-xs uppercase tracking-widest text-neutral-700 font-medium mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••"
                required
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center text-center rounded-xs mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

ForgotPasswordCard.propTypes = {
  initialEmail: PropTypes.string,
  onSuccess: PropTypes.func,
  onBack: PropTypes.func,
};

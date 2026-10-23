import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useCartStore } from '../../store/useCartStore';

/**
 * Reusable 6-Digit OTP Verification Card
 * Handles code entry, verification API call, resend countdown, and success transition.
 */
export default function OtpVerificationCard({
  email,
  title = 'Enter Verification Code',
  subtitle,
  onSuccess,
  onBack,
  backLabel = '← Back',
}) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');
  const inputRef = useRef(null);

  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 30s Countdown timer for Resend Code
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setErrorMessage('');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtp(pastedData);
      setErrorMessage('');
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Invalid verification code.');
      }

      if (data.user) {
        setUser(data.user);
      }

      if (onSuccess) {
        onSuccess(data.user, data.token);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');
    setResendSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to resend code.');
      }

      setResendCountdown(45); // 45 seconds cooldown
      setResendSuccessMsg('A new 6-digit code has been sent to your email.');
      showToast('New verification code sent to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send new code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-7 sm:p-9 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-center animate-fade-in">
      {/* Icon & Brand Header */}
      <div className="w-13 h-13 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
        <Mail className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-black tracking-widest text-neutral-900 uppercase">
          {title}
        </h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {subtitle || "We've sent a 6-digit verification code to:"}
        </p>
        <p className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 py-1 px-3 rounded-xs border border-neutral-200 inline-block">
          {email}
        </p>
      </div>

      {/* Error / Resend Messages */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-center gap-2 text-left animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resendSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2 text-left">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{resendSuccessMsg}</span>
        </div>
      )}

      {/* OTP Input Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1 text-center">
          <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">
            Enter 6-Digit Code
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            onPaste={handlePaste}
            placeholder="······"
            autoComplete="one-time-code"
            className="w-full text-center tracking-[0.55em] font-mono text-2xl font-bold py-3.5 bg-neutral-50 border border-neutral-300 focus:border-neutral-900 focus:bg-white rounded-xs outline-none transition-all placeholder:text-neutral-300 selection:bg-neutral-900 selection:text-white"
          />
          <p className="text-[11px] text-neutral-400 font-light mt-1">
            Check your Inbox and Spam folder. Code expires in 15 minutes.
          </p>
        </div>

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full h-11 bg-neutral-900 text-white text-xs uppercase tracking-widest font-bold rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </form>

      {/* Resend Code Option */}
      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] font-bold transition-colors cursor-pointer"
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCountdown > 0 || isResending}
          className={`uppercase tracking-wider text-[10px] font-bold transition-colors flex items-center gap-1.5 ${resendCountdown > 0
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-900 hover:underline cursor-pointer'
            }`}
        >
          <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
          {resendCountdown > 0 ? (
            <span>Resend in {resendCountdown}s</span>
          ) : (
            <span>Resend Code</span>
          )}
        </button>
      </div>
    </div>
  );
}

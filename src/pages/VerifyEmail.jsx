import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';
import OtpVerificationCard from '../components/auth/OtpVerificationCard';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const status = searchParams.get('status'); // 'success' or 'failed'
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token');
  const redirectParam = searchParams.get('redirect') || '/profile';

  const [activeEmail, setActiveEmail] = useState(emailParam);
  const [emailInput, setEmailInput] = useState(emailParam);
  const [countdown, setCountdown] = useState(3);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Handle legacy/link successful verification
  useEffect(() => {
    if (status !== 'success' || !emailParam) return;

    let isMounted = true;

    fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(emailParam)}`, {
      headers: {
        'Accept': 'application/json',
        ...(tokenParam ? { 'Authorization': `Bearer ${tokenParam}` } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user) {
          setUser(data.user);
          showToast('Email verified successfully! Welcome to AURA.');
        }
      })
      .catch((err) => {
        console.error('Failed to sync verified user session:', err);
      });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectParam);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [status, emailParam, tokenParam, navigate, setUser, showToast, redirectParam]);

  const handleSendOtpForEmail = async (e) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setEmailError('Please enter your email address.');
      return;
    }

    setIsSendingCode(true);
    setEmailError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActiveEmail(trimmed);
        showToast('6-Digit verification code sent to your email.');
      } else {
        setEmailError(data.error || data.message || 'No account found with this email.');
      }
    } catch {
      setEmailError('Server connection failed. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F9F9F8] flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-6">
      {/* 1. SUCCESS STATE (from legacy URL redirect) */}
      {status === 'success' ? (
        <div className="w-full max-w-md mx-auto bg-white p-8 sm:p-10 border border-neutral-200 shadow-sm rounded-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900">
              Email Verified Successfully!
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your account is now fully activated and verified.
            </p>
            {emailParam && (
              <p className="text-[11px] font-mono text-neutral-500 bg-neutral-50 py-1.5 px-3 rounded-xs border border-neutral-200 inline-block">
                {emailParam}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-center space-x-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p>
              Redirecting in <span className="font-bold text-neutral-900">{countdown}s</span>...
            </p>
          </div>
        </div>
      ) : activeEmail ? (
        /* 2. OTP VERIFICATION FORM */
        <OtpVerificationCard
          email={activeEmail}
          title="Verify Your Account"
          subtitle="Please enter the 6-digit verification code sent to:"
          backLabel="← Use another email"
          onBack={() => setActiveEmail('')}
          onSuccess={() => {
            showToast('Account verified successfully! Welcome to AURA.');
            navigate(redirectParam);
          }}
        />
      ) : (
        /* 3. PROMPT FOR EMAIL IF NOT PROVIDED IN URL */
        <div className="w-full max-w-md mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black tracking-widest text-neutral-900 uppercase">
              Account Verification
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Enter your registered email address to receive your 6-digit verification code.
            </p>
          </div>

          {emailError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs text-left">
              {emailError}
            </div>
          )}

          <form onSubmit={handleSendOtpForEmail} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 focus:border-neutral-900 focus:bg-white text-xs text-neutral-900 outline-none rounded-xs transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingCode}
              className="w-full h-11 bg-neutral-900 text-white text-xs uppercase tracking-widest font-bold rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSendingCode ? 'animate-spin' : ''}`} />
              <span>{isSendingCode ? 'Sending Code...' : 'Send Verification Code'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

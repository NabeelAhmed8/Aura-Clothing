import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const status = searchParams.get('status'); // 'success' or 'failed'
  const emailParam = searchParams.get('email');
  const tokenParam = searchParams.get('token');
  const errorMessage = searchParams.get('message');

  const [countdown, setCountdown] = useState(3);
  const [resendEmail, setResendEmail] = useState(emailParam || '');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState({ type: '', message: '' });

  // Handle successful verification & auto-login
  useEffect(() => {
    if (status !== 'success' || !emailParam) {
      return;
    }

    let isMounted = true;

    // Fetch verified user profile to initialize auth session
    fetch(`${API_BASE_URL}/api/auth/user-profile?email=${encodeURIComponent(emailParam)}`, {
      headers: {
        'Accept': 'application/json',
        ...(tokenParam ? { 'Authorization': `Bearer ${tokenParam}` } : {})
      }
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

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [status, emailParam, tokenParam, navigate, setUser, showToast]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setIsResending(true);
    setResendStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendStatus({ type: 'success', message: data.message || 'Verification link sent! Please check your inbox.' });
      } else {
        setResendStatus({ type: 'error', message: data.error || data.message || 'Failed to resend verification link.' });
      }
    } catch {
      setResendStatus({ type: 'error', message: 'Server connection error. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F8] flex flex-col justify-center items-center py-16 px-6">
      <div className="w-full max-w-md mx-auto bg-white p-8 sm:p-10 border border-neutral-200 shadow-sm rounded-sm text-center space-y-6">
        
        {/* Logo */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Email Verification</p>
        </div>

        {/* 1. SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900">
                Email Verified Successfully!
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your account is now fully activated and verified. You have been automatically signed in.
              </p>
              {emailParam && (
                <p className="text-[11px] font-mono text-neutral-500 bg-neutral-50 py-1.5 px-3 rounded-xs border border-neutral-200 inline-block">
                  {emailParam}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-center space-x-2 text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <p>
                Redirecting to your profile in <span className="font-bold text-neutral-900">{countdown}s</span>...
              </p>
            </div>
          </div>
        )}

        {/* 2. FAILED STATE */}
        {status === 'failed' && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900">
                Verification Failed
              </h2>
              <p className="text-xs text-red-600 leading-relaxed font-medium">
                {errorMessage || 'The verification link is invalid or has expired (links expire after 24 hours).'}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 text-left space-y-4">
              <p className="text-xs uppercase tracking-wider text-neutral-700 font-bold">
                Request a new link:
              </p>

              {resendStatus.message && (
                <div className={`p-3 text-xs rounded-sm text-center ${
                  resendStatus.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {resendStatus.message}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full bg-neutral-900 text-white py-3 px-4 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Sending...' : 'Resend Verification Link'}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. DEFAULT STATE (Direct visit) */}
        {!status && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-800 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900">
                Check Your Email
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Please check your inbox and click the verification link sent by AURA to activate your account.
              </p>
            </div>

            {resendStatus.message && (
              <div className={`p-3 text-xs rounded-sm text-center ${
                resendStatus.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {resendStatus.message}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium block">
                Didn't receive the email? Enter your address:
              </label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                disabled={isResending}
                className="w-full bg-neutral-900 text-white py-3.5 px-6 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending Link...' : 'Resend Verification Link'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-neutral-100 text-center">
              <Link to="/login" className="text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 font-bold">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useCartStore } from '../../store/useCartStore';

/**
 * Reusable Luxury Email Verification Link Sent Card
 * Replaces the OTP code input with a clean, modern "Check your email" link state.
 */
export default function VerificationLinkSentCard({
  email,
  title = 'Check Your Email',
  subtitle = 'We have sent a verification link to:',
  onBack,
  backLabel = '← Back to Sign In',
}) {
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = useCartStore((state) => state.showToast);

  // 30s Countdown timer for Resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleResendLink = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');
    setResendSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
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
        throw new Error(data.error || data.message || 'Failed to resend verification link.');
      }

      setResendCountdown(45); // 45 seconds cooldown
      setResendSuccessMsg('A fresh verification link has been sent to your email.');
      showToast('Fresh verification link sent to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send new link.');
    } finally {
      setIsResending(false);
    }
  };

  // Determine webmail shortcut
  const isGmail = email.toLowerCase().includes('gmail.com');
  const isOutlook = email.toLowerCase().includes('outlook.com') || email.toLowerCase().includes('hotmail.com');
  const webmailUrl = isGmail
    ? 'https://mail.google.com'
    : isOutlook
    ? 'https://outlook.live.com'
    : null;

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 border border-neutral-200 shadow-sm rounded-sm text-center animate-fade-in">
      {/* Mail Animated Icon Header */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md">
        <Mail className="w-8 h-8 text-white" />
      </div>

      {/* Brand Title */}
      <h1 className="text-2xl font-black tracking-widest text-neutral-900 uppercase">
        AURA
      </h1>
      <h2 className="text-sm uppercase tracking-widest text-neutral-800 font-bold mt-2">
        {title}
      </h2>

      {/* Subtitle & User Email */}
      <p className="text-xs text-neutral-500 mt-2">
        {subtitle}
      </p>
      <div className="mt-1 px-3 py-1.5 bg-neutral-100 rounded text-xs font-semibold text-neutral-900 inline-block max-w-full truncate border border-neutral-200">
        {email}
      </div>

      {/* Instructional Message */}
      <div className="my-6 p-4 bg-neutral-50 border border-neutral-200 rounded-sm text-left text-xs text-neutral-600 leading-relaxed space-y-2">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Click the <strong>Activate Account & Log In</strong> button inside the email to complete your verification.</span>
        </div>
        <div className="text-[11px] text-neutral-400 pl-6">
          Didn't find it in your primary inbox? Please check your <strong>Spam / Junk</strong> folder.
        </div>
      </div>

      {/* Open Webmail Shortcut Button */}
      {webmailUrl && (
        <a
          href={webmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-3 bg-neutral-900 text-white py-3.5 px-6 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 rounded-xs"
        >
          <span>Open {isGmail ? 'Gmail' : 'Outlook'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Resend Success / Error Alerts */}
      {resendSuccessMsg && (
        <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xs text-center font-medium">
          {resendSuccessMsg}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Resend Link Button */}
      <div className="pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={handleResendLink}
          disabled={resendCountdown > 0 || isResending}
          className="text-xs text-neutral-600 hover:text-neutral-900 font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending new link...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {resendCountdown > 0
                  ? `Resend link in ${resendCountdown}s`
                  : 'Resend Verification Link'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Back to Login / Change Email Link */}
      {onBack && (
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{backLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}


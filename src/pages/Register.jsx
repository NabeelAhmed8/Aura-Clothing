import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';
import OtpVerificationCard from '../components/auth/OtpVerificationCard';
import RegisterForm from '../components/auth/RegisterForm';
import AuthNoticeBanner from '../components/auth/AuthNoticeBanner';

/**
 * Single Responsibility: Orchestrates registration page state, triggers API signup,
 * and toggles between RegisterForm and OtpVerificationCard.
 */
export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';
  const emailParam = searchParams.get('email') || '';
  const reasonParam = searchParams.get('reason');
  const isAccountRequired =
    searchParams.get('message') === 'login_required' ||
    redirectPath === '/checkout' ||
    reasonParam === 'new_user';

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessRegistered, setIsSuccessRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const showToast = useCartStore((state) => state.showToast);
  const setUser = useCartStore((state) => state.setUser);

  const handleRegisterSubmit = async (formData) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName: (formData.firstName || '').trim(),
          lastName: (formData.lastName || '').trim(),
          name: `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: (formData.phone || '').trim(),
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed');
      }

      if (result.verificationRequired || result.requiresVerification) {
        setRegisteredEmail(formData.email.trim().toLowerCase());
        setIsSuccessRegistered(true);
        showToast('Verification code sent to your email.');
        return;
      }

      setUser({
        id: result.user?.id || result.user?._id,
        email: result.user?.email || formData.email,
        name: result.user?.name || `${formData.firstName} ${formData.lastName}`,
        firstName: result.user?.firstName || formData.firstName,
        lastName: result.user?.lastName || formData.lastName,
        phone: result.user?.phone || formData.phone || '',
        gender: result.user?.gender || formData.gender || '',
        token: result.token,
      });

      showToast('Account created successfully! Welcome to AURA.');
      navigate(redirectPath);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F9F9F8] flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6">
      {isSuccessRegistered ? (
        <OtpVerificationCard
          email={registeredEmail}
          title="Verify Your Account"
          subtitle="We have sent a 6-digit verification code to:"
          onSuccess={() => {
            showToast('Account verified successfully! Please sign in with your email and password.');
            navigate(
              `/login?email=${encodeURIComponent(registeredEmail)}&verified=true&redirect=${encodeURIComponent(redirectPath)}`
            );
          }}
          onBack={() => setIsSuccessRegistered(false)}
          backLabel="← Change Email / Back"
        />
      ) : (
        <div className="w-full max-w-md mx-auto bg-white p-5 sm:p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6 text-left">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-neutral-900">AURA</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Create a new account</p>
          </div>

          {isAccountRequired && (
            <AuthNoticeBanner
              variant="warning"
              title={reasonParam === 'new_user' ? 'New Customer Account' : 'Account Required'}
              message="Please complete your registration to proceed with checkout."
            />
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-sm text-center uppercase tracking-wider">
              {serverError}
            </div>
          )}

          <RegisterForm
            defaultEmail={emailParam}
            onSubmit={handleRegisterSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Bottom Switch to Sign In */}
      <div className="w-full max-w-md mx-auto text-center pt-4 border-t border-neutral-200 mt-4">
        <p className="text-xs text-neutral-600">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`}
            className="text-neutral-900 font-bold hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest mt-2">
        &copy; 2026 AURA | Independent Luxury Studio. All rights reserved.
      </div>
    </div>
  );
}

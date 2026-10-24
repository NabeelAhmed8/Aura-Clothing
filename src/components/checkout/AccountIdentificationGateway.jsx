import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AccountIdentificationGateway() {
  const navigate = useNavigate();
  const [directEmail, setDirectEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [directError, setDirectError] = useState('');

  const handleDirectEmailCheck = async (e) => {
    e.preventDefault();
    const trimmed = directEmail.trim().toLowerCase();
    if (!trimmed) {
      setDirectError('Please enter your email address.');
      return;
    }
    setIsVerifying(true);
    setDirectError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.isRegistered) {
        navigate(`/login?email=${encodeURIComponent(trimmed)}&redirect=/checkout&reason=registered`);
      } else {
        navigate(`/register?email=${encodeURIComponent(trimmed)}&redirect=/checkout&reason=new_user`);
      }
    } catch {
      navigate(`/login?email=${encodeURIComponent(trimmed)}&redirect=/checkout`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans flex flex-col justify-between">
      <main className="max-w-md mx-auto px-6 py-16 space-y-6 text-center w-full my-auto">
        <div className="w-14 h-14 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto shadow-xs text-neutral-900">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
            Atelier Checkout
          </span>
          <h1 className="text-2xl font-light uppercase tracking-wider text-neutral-900">
            Account Identification
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Please enter your email to proceed. Registered members will be directed to sign in, and new customers
            will complete quick registration.
          </p>
        </div>

        <form
          onSubmit={handleDirectEmailCheck}
          className="bg-white border border-neutral-200 p-6 rounded-xs shadow-xs space-y-4 text-left animate-fade-in"
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold block">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={directEmail}
              onChange={(e) => {
                setDirectEmail(e.target.value);
                if (directError) setDirectError('');
              }}
              placeholder="name@example.com"
              autoFocus
              className="w-full bg-[#F9F9F8] border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
            />
            {directError && <p className="text-[10px] text-red-600">{directError}</p>}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-neutral-900 text-white py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer rounded-xs flex items-center justify-center text-center space-x-2 shadow-xs"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Account...</span>
              </>
            ) : (
              <>
                <span>Continue to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <Link
          to="/shop"
          className="inline-block text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          &larr; Return to Shopping
        </Link>
      </main>
    </div>
  );
}

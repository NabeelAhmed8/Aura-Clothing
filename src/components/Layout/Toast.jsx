import { useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function Toast() {
  const toastMessage = useCartStore((state) => state.toastMessage);
  const location = useLocation();

  if (!toastMessage) return null;

  const isHome = location.pathname === '/';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-9999 pointer-events-none max-w-sm sm:max-w-md animate-fade-in transition-all duration-300"
      style={{
        bottom: isHome
          ? 'max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)))'
          : 'max(4.75rem, calc(4.5rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(1rem, calc(0.75rem + env(safe-area-inset-right, 0px)))',
      }}
    >
      <div className="bg-neutral-950/95 text-white backdrop-blur-md border border-neutral-800 text-xs uppercase tracking-wider px-5 py-3.5 rounded-xs shadow-2xl flex items-center space-x-3 pointer-events-auto">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-medium tracking-widest">{toastMessage}</span>
      </div>
    </div>
  );
}
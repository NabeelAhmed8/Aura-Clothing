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
      className="fixed z-9999 pointer-events-none w-auto max-w-[260px] sm:max-w-sm animate-fade-in transition-all duration-300"
      style={{
        bottom: isHome
          ? 'max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))'
          : 'max(4.5rem, calc(4rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(0.75rem, calc(0.75rem + env(safe-area-inset-right, 0px)))',
      }}
    >
      <div className="bg-neutral-950/95 text-white backdrop-blur-md border border-neutral-800 text-[10px] sm:text-xs uppercase px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xs shadow-2xl flex items-center space-x-2 sm:space-x-2.5 pointer-events-auto">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium tracking-wider leading-snug break-words">{toastMessage}</span>
      </div>
    </div>
  );
}
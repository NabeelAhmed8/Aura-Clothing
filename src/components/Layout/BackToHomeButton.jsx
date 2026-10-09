import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackToHomeButton() {
  const location = useLocation();

  // Agar user already home page ("/") par ho toh button hide rahega
  if (location.pathname === '/') {
    return null;
  }

  return (
    <aside
      aria-label="Quick home navigation"
      className="fixed z-45 select-none pointer-events-auto"
      style={{
        bottom: 'max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(1rem, calc(0.75rem + env(safe-area-inset-right, 0px)))',
      }}
    >
      <Link
        to="/"
        className="group inline-flex items-center justify-center gap-2 bg-neutral-900/95 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:bg-neutral-800 border border-neutral-700/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 min-w-max cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 min-h-10.5 sm:min-h-11"
        aria-label="Back to Home"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold whitespace-nowrap shrink-0 leading-none">
          Back to Home
        </span>
      </Link>
    </aside>
  );
}
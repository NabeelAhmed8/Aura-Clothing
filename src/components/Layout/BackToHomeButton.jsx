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
        className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-900/95 text-white shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:bg-neutral-800 border border-neutral-700/60 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        aria-label="Back to Home"
        title="Back to Home"
      >
        <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </Link>
    </aside>
  );
}
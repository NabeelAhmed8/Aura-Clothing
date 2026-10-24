import { Outlet } from 'react-router-dom';
import Footer from './Footer';

/**
 * MainLayout - Single Responsibility:
 * Wraps standard catalog & editorial pages with a consistent flex column,
 * light content canvas, and a unified pinned Footer.
 * Eliminates Footer code duplication across individual page components (DRY).
 */
export default function MainLayout() {
  return (
    <div className="flex-1 flex flex-col w-full bg-[#F9F9F8] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative min-h-0">
      <div className="flex-1 flex flex-col w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

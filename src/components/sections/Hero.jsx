import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
      gsap.from('.hero-image', { scale: 1.03, opacity: 0, duration: 1.2, ease: 'power2.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="w-full px-6 sm:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6 space-y-8">
        <div className="space-y-4">
          <span className="hero-text inline-block text-xs uppercase tracking-widest text-neutral-500 font-semibold">New Collection 2026</span>
          <h1 className="hero-text text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-neutral-900 leading-[1.1]">
            TIMELESS <br />
            <span className="font-serif italic font-normal">ESSENTIALS,</span>
          </h1>
          <p className="hero-text text-neutral-600 text-base sm:text-lg max-w-lg font-light leading-relaxed">
            Elevated wardrobe staples designed for modern living, crafted with sustainable luxury fabrics.
          </p>
        </div>
        <div className="hero-text flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/shop?category=Women" className="bg-neutral-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 min-h-11 text-xs uppercase tracking-widest font-bold flex items-center justify-center text-center hover:bg-neutral-800 transition-colors">
            Shop Women
          </Link>
          <Link to="/shop?category=Men" className="border border-neutral-900 text-neutral-900 px-6 sm:px-8 py-3.5 sm:py-4 min-h-11 text-xs uppercase tracking-widest font-bold flex items-center justify-center text-center hover:bg-neutral-900 hover:text-white transition-all">
            Shop Men
          </Link>
        </div>
      </div>
      <div className="lg:col-span-6 relative overflow-hidden bg-neutral-200 aspect-4/5 rounded-sm">
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" alt="Hero Editorial" className="hero-image w-full h-full object-cover" />
      </div>
    </section>
  );
}
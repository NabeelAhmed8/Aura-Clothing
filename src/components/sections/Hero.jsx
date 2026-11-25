import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', { 
        y: 35, 
        opacity: 0, 
        duration: 1, 
        stagger: 0.12, 
        ease: 'power3.out' 
      });
      gsap.from('.hero-visual-card', { 
        scale: 0.98, 
        opacity: 0, 
        duration: 1.2, 
        ease: 'power2.out',
        delay: 0.1
      });
      gsap.from('.hero-float-badge', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out'
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-18 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
        
        {/* Left Column: Editorial Brand Typography */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-7 sm:space-y-8">
          
          <div className="space-y-4">
            <div className="hero-text inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-700 font-medium">
                Spring / Summer 2026 Collection
              </span>
            </div>

            <h1 className="hero-text text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-light tracking-tight text-neutral-900 leading-[1.08]">
              TIMELESS <br />
              <span className="font-serif italic font-normal tracking-normal text-neutral-800">
                ESSENTIALS.
              </span>
            </h1>

            <p className="hero-text text-neutral-600 text-sm sm:text-base lg:text-lg max-w-xl font-light leading-relaxed">
              Elevated wardrobe staples designed for modern living. Architectural silhouettes, understated luxury, and sustainable organic fabrics crafted to transcend seasonal trends.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="hero-text flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
            <Link 
              to="/shop?category=Women" 
              className="group bg-neutral-900 text-white px-7 py-4 min-h-12 text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all rounded-xs shadow-xs cursor-pointer"
            >
              <span>Shop Women</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link 
              to="/shop?category=Men" 
              className="group border border-neutral-900 text-neutral-900 bg-transparent px-7 py-4 min-h-12 text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition-all rounded-xs cursor-pointer"
            >
              <span>Shop Men</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Luxury Editorial Attributes */}
          <div className="hero-text pt-4 border-t border-neutral-200/80 grid grid-cols-3 gap-4 text-left">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">Craft</p>
              <p className="text-xs font-medium text-neutral-900 mt-0.5">100% Organic Fabrics</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">Design</p>
              <p className="text-xs font-medium text-neutral-900 mt-0.5">Quiet Luxury Tailoring</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">Delivery</p>
              <p className="text-xs font-medium text-neutral-900 mt-0.5">Complimentary Worldwide</p>
            </div>
          </div>

        </div>

        {/* Right Column: Industry-Standard Editorial Visual Showcase */}
        <div className="lg:col-span-6 xl:col-span-6">
          <div className="hero-visual-card group relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-h-[640px] rounded-xs overflow-hidden bg-neutral-200 shadow-xl border border-neutral-200/80">
            
            {/* Main Editorial Image */}
            <img 
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=85&w=1200&auto=format&fit=crop" 
              alt="AURA Spring/Summer 2026 Editorial Campaign" 
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105" 
            />

            {/* Subtle Gradient Vignette for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-neutral-950/10 pointer-events-none" />

            {/* Top-Right Editorial Badge */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-900 border border-white/60 shadow-xs">
                Look 01 / SS-26
              </span>
            </div>

            {/* Bottom Floating Curated Look Card */}
            <div className="hero-float-badge absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-xs border border-white/70 shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-neutral-400 block">
                    Curated Spotlight
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    Tailored Double-Faced Coat
                  </p>
                  <p className="text-[10px] text-neutral-500 font-light mt-0.5">
                    Sustainable Wool & Cashmere
                  </p>
                </div>

                <Link
                  to="/shop?category=Women"
                  aria-label="Explore collection look"
                  className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

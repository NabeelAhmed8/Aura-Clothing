import { Link } from 'react-router-dom';

export default function Lookbook() {
  return (
    <section className="relative w-full bg-neutral-900 text-white overflow-hidden py-14 sm:py-20 lg:py-24 my-6 sm:my-10 lg:my-12">
      <div className="absolute inset-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
          alt="Summer Edit"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-neutral-950/20 to-neutral-950/40 pointer-events-none" />
      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 text-center space-y-4 sm:space-y-6 flex flex-col items-center justify-center">
        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-300 font-semibold">Editorial Summer 2026</span>
        <h2 className="text-[clamp(30px,7.5vw,60px)] font-light tracking-tight text-white leading-[1.1]">THE SUMMER EDIT</h2>
        <p className="text-neutral-200 sm:text-neutral-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed text-center">
          Embrace fluid silhouettes and lightweight linen textures tailored for warm escapes.
        </p>
        <div className="pt-2 sm:pt-4">
          <Link 
            to="/lookbook" 
            className="inline-flex items-center justify-center bg-white text-neutral-900 px-6 sm:px-8 py-3.5 sm:py-4 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors cursor-pointer rounded-xs text-center"
          >
            Explore Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
}
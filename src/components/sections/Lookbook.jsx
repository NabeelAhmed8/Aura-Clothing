import { Link } from 'react-router-dom';

export default function Lookbook() {
  return (
    <section className="relative w-full bg-neutral-900 text-white overflow-hidden py-24 my-12">
      <div className="absolute inset-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop" alt="Summer Edit" className="w-full h-full object-cover" />
      </div>
      <div className="relative w-full px-6 sm:px-8 text-center space-y-6 flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-neutral-300 font-semibold">Editorial Summer 2026</span>
        <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white leading-tight">THE SUMMER EDIT</h2>
        <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed text-center">
          Embrace fluid silhouettes and lightweight linen textures tailored for warm escapes.
        </p>
        <div className="pt-4">
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
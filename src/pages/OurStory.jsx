import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Feather, ShieldCheck, Compass } from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function OurStory() {
  // Page load hone par bilkul top par scroll kare
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-6 sm:px-12 lg:px-20 pt-6 pb-24 max-w-6xl mx-auto space-y-20">
        

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">
            The Philosophy & Heritage
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-900 uppercase">
            OUR STORY
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed pt-2">
            AURA was born from a desire to strip away the noise of fast fashion, returning to the essence of deliberate design, architectural silhouettes, and lasting craftsmanship.
          </p>
        </section>

        {/* Studio Showcase / Visual Banner */}
        <section className="relative w-full aspect-video md:aspect-21/9 bg-neutral-200 overflow-hidden rounded-sm border border-neutral-200">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80" 
            alt="AURA Design Studio" 
            className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-neutral-950/20" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-white">
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Atelier Studio</p>
            <p className="text-sm sm:text-lg uppercase tracking-wider font-light">Crafted With Precision & Quiet Luxury</p>
          </div>
        </section>

        {/* Narrative / About Text */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start border-t border-b border-neutral-200 py-16">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              The Genesis
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 uppercase">
              REDEFINING EVERYDAY ELEGANCE
            </h2>
          </div>
          <div className="space-y-6 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
            <p>
              Founded in 2026, AURA began as an independent studio committed to creating apparel that transcends seasonal expiration dates. Every silhouette is drafted with architectural balance, engineered to flatter through proportion rather than unnecessary ornamentation.
            </p>
            <p>
              We believe luxury should be quiet yet commanding. Our fabrics are sourced responsibly from ethical mills, prioritizing natural textures, breathable weights, and longevity. When you choose AURA, you invest in timeless pieces made to evolve with you.
            </p>
          </div>
        </section>

        {/* Core Pillars / Values */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Our Principles</span>
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight uppercase text-neutral-900">
              BUILT ON CONVICTION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 border border-neutral-200 rounded-sm text-center space-y-3">
              <div className="flex justify-center">
                <Sparkles className="w-5 h-5 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Deliberate Design</h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed text-center">
                Intentional cuts crafted with micro-adjustments for modern movement and enduring relevance.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm text-center space-y-3">
              <div className="flex justify-center">
                <Feather className="w-5 h-5 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Artisan Textiles</h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed text-center">
                Carefully selected natural blends and structured wools chosen for supreme hand-feel and durability.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm text-center space-y-3">
              <div className="flex justify-center">
                <ShieldCheck className="w-5 h-5 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Ethical Production</h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed text-center">
                Limited batch manufacturing ensuring fair atelier practices and minimal environmental impact.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm text-center space-y-3">
              <div className="flex justify-center">
                <Compass className="w-5 h-5 text-neutral-900" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Timeless Horizon</h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed text-center">
                Wardrobe cornerstones designed to be worn across years, resisting trend-driven cycles.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-white border border-neutral-200 p-8 sm:p-14 rounded-sm space-y-6 flex flex-col items-center justify-center text-center">
  <h3 className="text-xl sm:text-2xl font-light uppercase tracking-wider text-neutral-900 text-center w-full">
    DISCOVER THE LATEST CAPSULE
  </h3>
  <p className=" pb-5 text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto font-light text-center w-full leading-relaxed">
    Explore our curated inventory crafted with modern tailored essentials.
  </p>
  <div className="flex justify-center w-full">
    <Link 
      to="/shop" 
      className="inline-flex items-center justify-center bg-neutral-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs text-center"
    >
      Explore Collection
    </Link>
  </div>
</section>

      </main>

      <Footer />
    </div>
  );
}
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, Droplets, Globe, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function Sustainability() {
  // Page load hone par bilkul top par smooth scroll kare
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-6 sm:px-12 lg:px-20 pt-6 pb-24 max-w-6xl mx-auto space-y-20">
        

        {/* Hero Section */}
        <section className=" text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">
            Conscious Luxury & Ecology
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-900 uppercase">
            SUSTAINABILITY
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed pt-2">
            True luxury does not compromise the environment. We engineer low-impact, enduring garments crafted to reduce footprints while elevating daily living.
          </p>
        </section>

        {/* Visual Banner */}
        <section className="relative w-full aspect-video md:aspect-21/9 bg-neutral-200 overflow-hidden rounded-sm border border-neutral-200">
          <img 
            src="https://plus.unsplash.com/premium_photo-1673502751757-cfdc48a4904d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Sustainable Organic Raw Materials" 
            className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-neutral-950/20" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-white">
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Traceable Origins</p>
            <p className="text-sm sm:text-lg uppercase tracking-wider font-light">100% Certified Organic & Reclaimed Fibers</p>
          </div>
        </section>

        {/* Core Environmental Pillars */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Our Commitments</span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight uppercase text-neutral-900">
              HARMONY WITH THE EARTH
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-3">
              <Leaf className="w-5 h-5 text-neutral-900 mx-auto" />
              <h3 className="min-h-8 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest text-neutral-900">Pure Organic Fibers</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                GOTS-certified linen, organic cotton, and cruelty-free alpaca wool free of toxic chemicals.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-3">
              <Droplets className="w-5 h-5 text-neutral-900 mx-auto" />
              <h3 className="min-h-8 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest text-neutral-900">Zero-Waste Dyeing</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Closed-loop water filtration and non-carcinogenic botanical mineral pigments for all color palettes.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-3">
              <Recycle className="w-5 h-5 text-neutral-900 mx-auto" />
              <h3 className="min-h-8 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest text-neutral-900">Circular Packaging</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                FSC-certified paper boxes, compostable vegetable garment bags, and recycled cotton shipping tape.
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-3">
              <Globe className="w-5 h-5 text-neutral-900 mx-auto" />
              <h3 className="min-h-8 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest text-neutral-900">Carbon Offset Logistics</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                We measure our global transit footprint and invest directly in verified renewable reforestation projects.
              </p>
            </div>
          </div>
        </section>

        {/* Narrative / Lifecycle Metrics */}
        <section className="bg-white border border-neutral-200 p-8 sm:p-12 rounded-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 text-center items-stretch">
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 py-6 md:py-0 md:px-6">
            <p className="h-12 flex items-center text-3xl sm:text-4xl font-light text-neutral-900">84%</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-neutral-700">Less Water Utilized</p>
            <p className="text-[11px] text-neutral-500 font-light">Compared to conventional luxury industrial manufacturing.</p>
          </div>
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 py-6 md:py-0 md:px-6">
            <p className="h-12 flex items-center text-3xl sm:text-4xl font-light text-neutral-900">100%</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-neutral-700">Plastic-Free Packaging</p>
            <p className="text-[11px] text-neutral-500 font-light">Completely biodegradable packaging materials and trims.</p>
          </div>
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 py-6 md:py-0 md:px-6">
            <p className="h-12 flex items-center text-3xl sm:text-4xl font-light text-neutral-900">Fair Trade</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-neutral-700">Artisan Guild Standards</p>
            <p className="text-[11px] text-neutral-500 font-light">Living wages and dignified working hours across all partner mills.</p>
          </div>
        </section>

        {/* Detailed Standards Checklist */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              The AURA Pledge
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 uppercase">
              ACCOUNTABILITY IN EVERY THREAD
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              We reject the volume-driven churn of seasonal fashion. Our limited-edition runs prevent surplus waste and prioritize heirloom-grade construction so every piece endures in your wardrobe for decades.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 border border-neutral-200 rounded-sm space-y-4">
            {[
              'Regenerative agriculture fiber verification',
              'Hazardous chemical elimination across production',
              'Complimentary garment repair consultations',
              'Traceable lot numbering on every luxury garment'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <span className="text-xs text-neutral-700 font-medium tracking-wide uppercase">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-white border border-neutral-200 p-8 sm:p-14 rounded-sm space-y-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl sm:text-2xl font-light uppercase tracking-wider text-neutral-900 text-center w-full">
            EXPLORE OUR CONSCIOUS COLLECTION
          </h3>
          <p className=" pb-5 text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto font-light text-center w-full leading-relaxed">
            Shop thoughtful silhouettes crafted with low-impact materials and timeless silhouettes.
          </p>
          <div className="flex justify-center w-full">
            <Link 
              to="/shop" 
              className="inline-flex items-center justify-center bg-neutral-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs text-center"
            >
              Shop Sustainable Edit
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
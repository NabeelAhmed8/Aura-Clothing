import Hero from '../components/sections/Hero';
import BrandValues from '../components/sections/BrandValues';
import ProductGrid from '../components/sections/ProductGrid';
import Lookbook from '../components/sections/Lookbook';
import Footer from '../components/Layout/Footer';

export default function Home() {
  return (
    <div className="bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      {/* Navbar aur AnnouncementBar yahan se mukammal remove kar diye hain */}
      <main className="w-full">
        <Hero />
        <BrandValues />
        <ProductGrid />
        <Lookbook />
      </main>
      <Footer />
    </div>
  );
}
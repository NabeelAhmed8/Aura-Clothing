import Hero from '../components/sections/Hero';
import BrandValues from '../components/sections/BrandValues';
import ProductGrid from '../components/sections/ProductGrid';
import Lookbook from '../components/sections/Lookbook';

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <Hero />
      <BrandValues />
      <ProductGrid />
      <Lookbook />
    </div>
  );
}

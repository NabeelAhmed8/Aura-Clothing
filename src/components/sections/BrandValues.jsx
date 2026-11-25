import { ShieldCheck, RefreshCw, Leaf, Truck } from 'lucide-react';

export default function BrandValues() {
  const values = [
    { icon: <Leaf className="w-5 h-5 text-neutral-900" />, title: "Sustainable Production", description: "Crafted responsibly using eco-friendly materials." },
    { icon: <Truck className="w-5 h-5 text-neutral-900" />, title: "Free Global Shipping", description: "Complimentary express delivery on orders over $75." },
    { icon: <RefreshCw className="w-5 h-5 text-neutral-900" />, title: "Easy Global Returns", description: "Hassle-free 30-day return policy worldwide." },
    { icon: <ShieldCheck className="w-5 h-5 text-neutral-900" />, title: "Secure Checkout", description: "Protected encrypted transactions guaranteed." }
  ];

  return (
    <section className="w-full border-y border-neutral-200 py-8 sm:py-12 bg-[#F9F9F8]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-6 lg:gap-8">
          {values.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-2 sm:space-y-3 p-2 sm:p-4">
              <div className="p-2.5 sm:p-3 bg-neutral-100 rounded-full">{item.icon}</div>
              <h3 className="text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold text-neutral-900">{item.title}</h3>
              <p className="text-[11px] sm:text-xs text-neutral-600 font-light leading-relaxed max-w-[26ch]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { ShieldCheck, RefreshCw, Leaf, Truck } from 'lucide-react';

export default function BrandValues() {
  const values = [
    { icon: <Leaf className="w-5 h-5 text-neutral-900" />, title: "Sustainable Production", description: "Crafted responsibly using eco-friendly materials." },
    { icon: <Truck className="w-5 h-5 text-neutral-900" />, title: "Free Global Shipping", description: "Complimentary express delivery on orders over $75." },
    { icon: <RefreshCw className="w-5 h-5 text-neutral-900" />, title: "Easy Global Returns", description: "Hassle-free 30-day return policy worldwide." },
    { icon: <ShieldCheck className="w-5 h-5 text-neutral-900" />, title: "Secure Checkout", description: "Protected encrypted transactions guaranteed." }
  ];

  return (
    <section className="w-full border-y border-neutral-200 py-12 bg-[#F9F9F8]">
      <div className="w-full px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="p-3 bg-neutral-100 rounded-full">{item.icon}</div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">{item.title}</h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
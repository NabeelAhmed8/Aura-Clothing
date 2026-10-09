import { useNavigate } from 'react-router-dom';

export default function FeaturedCategories() {
  const navigate = useNavigate();

  const categories = [
    { 
      title: "Women's Outerwear", 
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop", 
      categoryKey: "Women" 
    },
    { 
      title: "Men's Knitwear", 
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop", 
      categoryKey: "Men" 
    },
    { 
      title: "Accessories & Leather", 
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", 
      categoryKey: "Accessories" 
    }
  ];

  const handleCategoryClick = (categoryKey) => {
    navigate(`/shop?category=${categoryKey}`);
  };

  return (
    <section className="w-full px-6 sm:px-8 py-20">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Explore Collections</span>
        <h2 className="text-3xl font-light tracking-tight text-neutral-900">FEATURED CATEGORIES</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, index) => (
          <div 
            key={index} 
            onClick={() => handleCategoryClick(cat.categoryKey)}
            className="group relative bg-neutral-200 overflow-hidden rounded-sm flex flex-col justify-end p-8 cursor-pointer select-none"
            style={{ aspectRatio: '4/5' }}
          >
            <img 
              src={cat.image} 
              alt={cat.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to top, rgba(23, 23, 23, 0.7), rgba(23, 23, 23, 0.2), transparent)' }}
            />
            
            <div className="relative z-10 space-y-2">
              <h3 className="text-white text-lg font-medium tracking-wide">{cat.title}</h3>
              <span className="inline-block text-[10px] uppercase tracking-widest text-white/80 border-b border-white/40 pb-0.5">
                Discover Now
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
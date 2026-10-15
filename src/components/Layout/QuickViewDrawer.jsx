import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  Send,
  Ruler
} from 'lucide-react';
import { useQuickViewStore } from '../../store/useQuickViewStore';
import { useCartStore } from '../../store/useCartStore';
import { API_BASE_URL } from '../../config/api';

const COLOR_SWATCHES = [
  { name: 'Onyx Black', hex: '#18181b', ring: 'ring-neutral-900' },
  { name: 'Warm Ecru', hex: '#EAE6DF', ring: 'ring-neutral-400' },
  { name: 'Olive Khaki', hex: '#525a49', ring: 'ring-[#525a49]' },
  { name: 'Camel Tan', hex: '#a6825c', ring: 'ring-[#a6825c]' },
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function QuickViewDrawer() {
  const navigate = useNavigate();
  const { isOpen, product, closeQuickView, toggleWishlist, isInWishlist } = useQuickViewStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useCartStore((state) => state.showToast);

  // Component state
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0].name);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(null); // 'care' | 'shipping' | 'reviews' | null
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Real Database Reviews state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [recentReviews, setRecentReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch real reviews from MongoDB when product opens
  const productId = product ? (product.id || product._id) : null;
  useEffect(() => {
    if (!productId || !isOpen) return;

    let isMounted = true;
    setIsLoadingReviews(true);

    fetch(`${API_BASE_URL}/api/reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && Array.isArray(data.reviews)) {
          setRecentReviews(data.reviews);
        } else {
          setRecentReviews([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err);
        if (isMounted) setRecentReviews([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, isOpen]);

  // Body overflow locking & Esc key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeQuickView();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, closeQuickView]);

  if (!isOpen || !product) return null;

  // Authentic product thumbnails: Use actual product images if provided, or single image
  const thumbnails = Array.isArray(product.images) && product.images.length > 0
    ? [product.image, ...product.images.filter((img) => img !== product.image)]
    : [product.image].filter(Boolean);

  const isFavorited = isInWishlist(product.id || product._id);
  const hasDiscount = Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
  const originalPrice = hasDiscount ? Number(product.originalPrice) : null;
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  // Real review aggregates
  const totalReviewsCount = recentReviews.length;
  const averageRating = totalReviewsCount > 0
    ? (recentReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : null;

  // Dynamic Out of Stock Detection
  const isOutOfStock = 
    product.inStock === false || 
    product.isOutOfStock === true || 
    (typeof product.stock === 'number' && product.stock <= 0) || 
    (typeof product.countInStock === 'number' && product.countInStock <= 0) || 
    product.status === 'out_of_stock' || 
    product.status === 'sold_out' || 
    product.status === 'OutOfStock';

  const handleWishlistToggle = () => {
    const isNowFavorite = toggleWishlist(product.id || product._id);
    showToast(isNowFavorite ? 'Added to your Wishlist ❤️' : 'Removed from your Wishlist');
  };

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        selectedSize,
        selectedColor,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    addToCart(
      {
        ...product,
        selectedSize,
        selectedColor,
      },
      quantity
    );
    closeQuickView();
    navigate('/checkout');
  };

  const toggleAccordion = (section) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  // Submit real review to MongoDB
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewComment.trim()) {
      showToast('Please enter your name and review text');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || product._id,
          author: newReviewerName.trim(),
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          verified: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setRecentReviews((prev) => [data.review, ...prev]);
        setNewReviewerName('');
        setNewReviewComment('');
        setShowReviewForm(false);
        showToast('Review submitted successfully and saved to database!');
      } else {
        showToast(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      showToast('Server error: Could not save review to database.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-999 w-full overflow-hidden"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 select-none"
        onClick={closeQuickView}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel: Wider, compact & ergonomic */}
      <div 
        className="fixed top-0 bottom-0 right-0 w-full sm:max-w-xl md:max-w-2xl flex flex-col bg-[#FDFDFD] shadow-2xl border-l border-neutral-200 z-10 overflow-hidden text-left select-text"
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        {/* 1. Header & Navigation (Opar ka Hissa) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-white/95 backdrop-blur-xs shrink-0 text-left">
          <div className="text-left">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500 block text-left">
              Aura Atelier • Quick View
            </span>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-900 line-clamp-1 text-left">
              {product.name}
            </h2>
          </div>
          
          <button
            type="button"
            onClick={closeQuickView}
            aria-label="Close Quick View"
            className="p-1.5 -mr-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin text-left">
          
          {/* 2 & 3 & 4. Ergonomic Split Hero: Compact Image on Left + Attributes on Right */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start text-left">
            
            {/* Left: Compact Image + Thumbnails */}
            <div className="sm:col-span-5 flex flex-col items-center sm:items-start space-y-2.5 text-left">
              <div className="relative aspect-3/4 w-48 sm:w-full max-h-56 sm:max-h-64 bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200 group mx-auto sm:mx-0">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Category Badge & Out of Stock Badge */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <div className="bg-neutral-900/85 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                    {product.category || 'Luxury'}
                  </div>
                  {isOutOfStock && (
                    <div className="bg-rose-900/90 backdrop-blur-xs text-white px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs shadow-xs">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Wishlist Heart Icon floating */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-full shadow-xs hover:scale-110 transition-transform cursor-pointer"
                >
                  <Heart 
                    className={`w-3.5 h-3.5 transition-colors ${
                      isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                    }`} 
                  />
                </button>
              </div>

              {/* Thumbnails underneath */}
              {thumbnails.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto justify-center sm:justify-start w-full pb-0.5">
                  {thumbnails.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-12 h-14 shrink-0 rounded-xs overflow-hidden border transition-all cursor-pointer ${
                        activeImage === imgUrl 
                          ? 'border-neutral-900 shadow-xs ring-1 ring-neutral-900' 
                          : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt="" 
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Pricing, Stock, Sizes, Colors & Overview */}
            <div className="sm:col-span-7 space-y-3.5 text-left">
              
              {/* Pricing & Stock Status */}
              <div className="space-y-1 text-left pb-3 border-b border-neutral-100">
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-baseline gap-2 text-left">
                    <span className="text-2xl font-bold text-neutral-900 text-left">
                      ${product.price}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-xs text-neutral-400 line-through text-left">
                          ${originalPrice}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs text-left">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dynamic Stock Status Badge */}
                  {isOutOfStock ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[9px] font-semibold tracking-wider shrink-0 transition-colors animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-semibold tracking-wider shrink-0 transition-colors animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 font-light text-left">
                  All duties & taxes included • Free 2-4 day shipping
                </p>
              </div>

              {/* Sizes Selection */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs text-left">
                  <span className="uppercase tracking-widest text-neutral-600 font-semibold text-[10px] text-left">
                    Select Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] text-neutral-600 underline cursor-pointer hover:text-neutral-900 text-right flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3 h-3 text-neutral-500" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xs border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Swatches */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs text-left">
                  <span className="uppercase tracking-widest text-neutral-600 font-semibold text-[10px] text-left">
                    Color: <span className="font-normal text-neutral-900">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 justify-start">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border border-neutral-300 ${
                        selectedColor === color.name ? `ring-2 ring-offset-2 ${color.ring}` : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <Check className={`w-3 h-3 ${color.name === 'Warm Ecru' ? 'text-neutral-900' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="pt-2 border-t border-neutral-100 text-left">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block text-left mb-1">
                  Product Details
                </span>
                <p className="text-[11px] text-neutral-600 font-light leading-relaxed text-left line-clamp-3">
                  {product.description || 'Masterfully crafted from ultra-fine breathable natural fabrics. Features structured silhouettes, refined micro-stitching, and an effortless drape tailored for all-day comfort.'}
                </p>
              </div>

            </div>
          </div>

          {/* 5 & 6. Collapsible Details, Care, Shipping & Customer Reviews */}
          <div className="border-t border-neutral-200 pt-1 space-y-1 text-left">
            
            {/* Accordion 1: Material & Care */}
            <div className="border-b border-neutral-100 text-left">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="w-full py-2.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-neutral-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-left">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                  Material & Fabric Care
                </span>
                {openAccordion === 'care' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              {openAccordion === 'care' && (
                <div className="pb-3 text-xs text-neutral-500 font-light space-y-1 pl-5 animate-fade-in text-left">
                  <p className="text-left">• 100% Pure Organic Combed Cotton / Wool Blend.</p>
                  <p className="text-left">• Machine wash cold delicate cycle with like colors.</p>
                  <p className="text-left">• Do not tumble dry. Cool iron inside out.</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Delivery & Returns */}
            <div className="border-b border-neutral-100 text-left">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-2.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-neutral-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-left">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  Delivery & 14-Day Returns
                </span>
                {openAccordion === 'shipping' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-3 text-xs text-neutral-500 font-light space-y-1 pl-5 animate-fade-in text-left">
                  <p className="text-left">• Free express shipping nationwide (2–4 business days delivery).</p>
                  <p className="text-left">• Complimentary doorstep parcel inspection supported.</p>
                  <p className="text-left">• Easy 14-day hassle-free exchange & return guarantee.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Customer Reviews */}
            <div className="border-b border-neutral-100 text-left">
              <button
                type="button"
                onClick={() => toggleAccordion('reviews')}
                className="w-full py-2.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-neutral-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-left">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {totalReviewsCount > 0
                    ? `Customer Reviews (${averageRating} / 5.0 • ${totalReviewsCount} ${totalReviewsCount === 1 ? 'review' : 'reviews'})`
                    : 'Customer Reviews (0 Reviews • Be the first)'}
                </span>
                {openAccordion === 'reviews' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              
              {openAccordion === 'reviews' && (
                <div className="pb-4 pt-1 space-y-3 pl-2 sm:pl-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between text-left">
                    <span className="text-[10px] uppercase font-bold text-neutral-700">
                      Verified Buyer Feedback ({totalReviewsCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-[10px] uppercase tracking-wider font-bold text-neutral-900 underline hover:text-neutral-600 cursor-pointer"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-2 animate-fade-in text-left">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-700 block text-left">
                        Share Your Experience
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-left">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="cursor-pointer"
                          >
                            <Star 
                              className={`w-3.5 h-3.5 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} 
                            />
                          </button>
                        ))}
                        <span className="text-[10px] text-neutral-500 ml-2">{newReviewRating} Stars</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Your Name (e.g. Tariq Khan)"
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-2 text-xs focus:outline-none focus:border-neutral-900 text-left"
                        required
                      />
                      <textarea
                        rows={2}
                        placeholder="Describe fabric quality and fit..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-2 text-xs focus:outline-none focus:border-neutral-900 text-left"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold py-2 hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        {isSubmittingReview ? 'Submitting to database...' : 'Submit Review'}
                      </button>
                    </form>
                  )}

                  {/* Real Reviews List */}
                  {isLoadingReviews ? (
                    <p className="text-xs text-neutral-400 py-3 text-left">
                      Loading verified reviews from database...
                    </p>
                  ) : recentReviews.length === 0 ? (
                    <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200/60 text-left space-y-1">
                      <p className="text-xs font-semibold text-neutral-800">No reviews yet for this piece.</p>
                      <p className="text-[11px] text-neutral-500 font-light">
                        Be the first verified customer to share thoughts on fabric and silhouette.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left max-h-60 overflow-y-auto pr-1">
                      {recentReviews.map((rev) => (
                        <div key={rev._id || rev.id} className="p-2.5 bg-neutral-50 rounded-xs space-y-1 text-left border border-neutral-200/60">
                          <div className="flex items-center justify-between text-xs text-left">
                            <span className="font-semibold text-neutral-900 flex items-center gap-1 text-left text-[11px]">
                              {rev.author}
                              {rev.verified && (
                                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-xs font-normal">
                                  Verified
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-neutral-400 text-right">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : (rev.date || 'Recent')}
                            </span>
                          </div>
                          <div className="flex items-center text-amber-500 text-left">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-[11px] text-neutral-600 font-light leading-relaxed text-left">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Trust Highlights - Compact Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-left">
            <div className="p-2 bg-neutral-50 rounded-xs flex items-center gap-2 text-left border border-neutral-200/60">
              <Truck className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 block text-left">Fast Shipping</span>
                <span className="text-[8px] text-neutral-500 block text-left">2-4 Days</span>
              </div>
            </div>
            <div className="p-2 bg-neutral-50 rounded-xs flex items-center gap-2 text-left border border-neutral-200/60">
              <RotateCcw className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 block text-left">14-Day Return</span>
                <span className="text-[8px] text-neutral-500 block text-left">Easy Exchange</span>
              </div>
            </div>
            <div className="p-2 bg-neutral-50 rounded-xs flex items-center gap-2 text-left border border-neutral-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 block text-left">Authentic</span>
                <span className="text-[8px] text-neutral-500 block text-left">Guaranteed</span>
              </div>
            </div>
          </div>

        </div>

        {/* 7. Call to Action (Fixed Bottom Sticky Bar - Always In View) */}
        <div className="px-5 py-3.5 border-t border-neutral-200 bg-white shadow-lg space-y-2.5 shrink-0 text-left">
          <div className="flex items-center gap-2.5">
            {/* Quantity Stepper */}
            <div className={`flex items-center justify-between border border-neutral-300 rounded-xs bg-neutral-50 h-9.5 w-26 shrink-0 ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-7 h-full flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="text-xs font-semibold text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-7 h-full flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              title={isFavorited ? 'In Wishlist' : 'Add to Wishlist'}
              className={`h-9.5 w-9.5 flex items-center justify-center border rounded-xs transition-colors cursor-pointer shrink-0 ${
                isFavorited 
                  ? 'border-red-200 bg-red-50 text-red-500' 
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
            </button>

            {/* Primary Add to Cart Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 h-9.5 px-4 text-xs uppercase tracking-widest font-bold transition-colors rounded-xs flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {isOutOfStock ? 'Out of Stock' : `Add To Cart • $${(Number(product.price || 0) * quantity).toFixed(2)}`}
            </button>
          </div>

          {/* Buy Now / Direct Checkout Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`w-full border h-8.5 px-3 text-[10px] uppercase tracking-widest font-bold transition-colors rounded-xs flex items-center justify-center text-center ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-900 border-neutral-300 hover:bg-neutral-200 cursor-pointer'
            }`}
          >
            {isOutOfStock ? 'Currently Unavailable' : 'Buy Now (Instant Checkout)'}
          </button>
        </div>

      </div>

      {/* 8. ATELIER SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-neutral-200 shadow-2xl max-w-lg w-full p-6 text-left space-y-5 rounded-xs relative">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                  Atelier Standards
                </span>
                <h3 className="text-base font-light uppercase tracking-wider text-neutral-900">
                  Size & Measurement Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Measurements reflect true garment specifications in inches and centimeters. For relaxed drape silhouettes, select your standard size.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-[10px] uppercase tracking-widest text-neutral-700">
                    <th className="p-2.5 font-bold">Size</th>
                    <th className="p-2.5 font-bold">Chest (in/cm)</th>
                    <th className="p-2.5 font-bold">Waist (in/cm)</th>
                    <th className="p-2.5 font-bold">Hip (in/cm)</th>
                    <th className="p-2.5 font-bold">Length (in/cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-600">
                  <tr className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">XS</td>
                    <td className="p-2.5">34" / 86cm</td>
                    <td className="p-2.5">28" / 71cm</td>
                    <td className="p-2.5">35" / 89cm</td>
                    <td className="p-2.5">26" / 66cm</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">S</td>
                    <td className="p-2.5">36" / 91cm</td>
                    <td className="p-2.5">30" / 76cm</td>
                    <td className="p-2.5">37" / 94cm</td>
                    <td className="p-2.5">27" / 68cm</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 bg-neutral-50/50">
                    <td className="p-2.5 font-bold text-neutral-900">M</td>
                    <td className="p-2.5">38" / 96cm</td>
                    <td className="p-2.5">32" / 81cm</td>
                    <td className="p-2.5">39" / 99cm</td>
                    <td className="p-2.5">28" / 71cm</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">L</td>
                    <td className="p-2.5">41" / 104cm</td>
                    <td className="p-2.5">35" / 89cm</td>
                    <td className="p-2.5">42" / 106cm</td>
                    <td className="p-2.5">29" / 74cm</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">XL</td>
                    <td className="p-2.5">44" / 112cm</td>
                    <td className="p-2.5">38" / 96cm</td>
                    <td className="p-2.5">45" / 114cm</td>
                    <td className="p-2.5">30" / 76cm</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">XXL</td>
                    <td className="p-2.5">47" / 119cm</td>
                    <td className="p-2.5">41" / 104cm</td>
                    <td className="p-2.5">48" / 122cm</td>
                    <td className="p-2.5">31" / 79cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="w-full bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close Size Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

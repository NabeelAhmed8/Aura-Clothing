import { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function QuickViewReviews({
  productId,
  isOpen,
  isOpenAccordion,
  onToggleAccordion,
  showToast,
}) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [recentReviews, setRecentReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId || !isOpen) return;

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      if (isMounted) setIsLoadingReviews(true);
    }, 0);

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
      window.clearTimeout(timeoutId);
    };
  }, [productId, isOpen]);

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
          productId,
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

  const totalReviewsCount = recentReviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (recentReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  return (
    <div className="border-b border-neutral-100 text-left">
      <button
        type="button"
        onClick={onToggleAccordion}
        className="w-full py-2.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-neutral-900 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-left">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          {totalReviewsCount > 0
            ? `Customer Reviews (${averageRating} / 5.0 • ${totalReviewsCount} ${
                totalReviewsCount === 1 ? 'review' : 'reviews'
              })`
            : 'Customer Reviews (0 Reviews • Be the first)'}
        </span>
        {isOpenAccordion ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {isOpenAccordion && (
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

          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-2 animate-fade-in text-left"
            >
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
                      className={`w-3.5 h-3.5 ${
                        star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                      }`}
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
                <div
                  key={rev._id || rev.id}
                  className="p-2.5 bg-neutral-50 rounded-xs space-y-1 text-left border border-neutral-200/60"
                >
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
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : rev.date || 'Recent'}
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
  );
}

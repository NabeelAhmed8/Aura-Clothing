import { useState, useEffect, useRef } from 'react';

/**
 * Helper to optimize external Unsplash images for thumbnails/grid
 */
const optimizeImageUrl = (url, targetWidth = 600) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(targetWidth));
      u.searchParams.set('q', '75');
      u.searchParams.set('auto', 'format');
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
};

/**
 * High-performance LazyImage Component
 * - Intersection Observer based lazy loading (loads 200px before viewport)
 * - Shimmer skeleton placeholder while loading
 * - Smooth fade-in transition once loaded
 * - Automatic Unsplash image optimization
 * - Fallback handling on error
 */
export default function LazyImage({
  src,
  alt = 'Product image',
  className = '',
  wrapperClassName = '',
  aspectRatio = 'aspect-3/4',
  targetWidth = 600,
  onClick,
}) {
  const [isVisible, setIsVisible] = useState(() => {
    return typeof window !== 'undefined' && !('IntersectionObserver' in window);
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // Start loading 200px before scrolling into view
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, []);

  const optimizedSrc = optimizeImageUrl(src, targetWidth);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative overflow-hidden bg-neutral-100 ${aspectRatio} ${wrapperClassName}`}
    >
      {/* 1. Shimmer Skeleton Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
      )}

      {/* 2. Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-2 text-center">
          <span className="text-[10px] uppercase tracking-wider font-medium">Image unavailable</span>
        </div>
      ) : (
        /* 3. Actual Image */
        isVisible && (
          <img
            src={optimizedSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${className}`}
          />
        )
      )}
    </div>
  );
}

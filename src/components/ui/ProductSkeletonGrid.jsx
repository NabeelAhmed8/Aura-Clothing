export default function ProductSkeletonGrid({ count = 12, aspectRatio = 'aspect-4/5' }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white p-2.5 rounded-sm border border-neutral-200">
          <div className={`${aspectRatio} bg-neutral-200 rounded-xs mb-3`} />
          <div className="h-2.5 bg-neutral-200 rounded-xs w-1/3 mb-2" />
          <div className="h-3 bg-neutral-200 rounded-xs w-3/4 mb-2" />
          <div className="h-3 bg-neutral-200 rounded-xs w-1/4 mb-4" />
          <div className="h-9 bg-neutral-100 rounded-xs" />
        </div>
      ))}
    </div>
  );
}

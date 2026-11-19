export default function ProductErrorState({
  title = 'Unable to Load Items',
  message = "We couldn't load the products right now. Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="w-full flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto bg-white border border-neutral-200 rounded-xs p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 text-center w-full">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed text-center max-w-sm mx-auto">
          {message}
        </p>
        {onRetry && (
          <div className="pt-2 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-2.5 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs cursor-pointer inline-flex items-center justify-center"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

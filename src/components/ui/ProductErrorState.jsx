export default function ProductErrorState({
  error,
  onRetry,
  message = 'Backend server connect nahi ho raha. Server start karein aur retry karein.',
}) {
  return (
    <div className="text-center py-14 px-6 bg-white border border-neutral-200 rounded-xs max-w-md mx-auto my-8 space-y-3">
      <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold block">
        Offline
      </span>
      <p className="text-xs font-semibold text-neutral-800">
        {error}
      </p>
      <p className="text-[11px] text-neutral-500">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors rounded-xs cursor-pointer"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

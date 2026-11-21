import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Helper to generate page numbers with ellipsis (...)
 * Returns an array of numbers and '...' strings.
 */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the beginning: 1 2 3 4 5 ... 10
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // Near the end: 1 ... 6 7 8 9 10
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle: 1 ... 4 5 6 ... 10
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-neutral-200/80 ${className}`}
    >
      {/* Items count summary */}
      <div className="text-xs tracking-wider text-neutral-500 uppercase font-light order-2 sm:order-1">
        {totalItems !== undefined && startItem && endItem ? (
          <span>
            Showing <strong className="font-semibold text-neutral-900">{startItem}–{endItem}</strong> of{' '}
            <strong className="font-semibold text-neutral-900">{totalItems}</strong> products
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-neutral-900">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-neutral-900">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2 select-none">
        {/* First Page button (for large page counts) */}
        {totalPages > 7 && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            title="First page"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xs border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-xs border border-neutral-200 bg-white text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-7 h-8 inline-flex items-center justify-center text-xs text-neutral-400 font-bold"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`min-w-8 h-8 px-2 text-xs font-medium rounded-xs border transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-xs border border-neutral-200 bg-white text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page button (for large page counts) */}
        {totalPages > 7 && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            title="Last page"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xs border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
}

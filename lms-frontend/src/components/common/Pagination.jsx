import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component for Client-side & SPA tables
 * 
 * @param {number} currentPage Current page number (1-indexed)
 * @param {number} totalItems Total number of items
 * @param {number} pageSize Number of items per page (default: 5)
 * @param {function} onPageChange Callback triggered with new page number
 * @param {string} className Additional container styling
 */
export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis for large page sets
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 bg-[#FAF9FC] border-t border-[#E4E4E0] text-xs ${className}`}>
      {/* Left info */}
      <div className="text-[#5E5E5E] font-medium">
        Hiển thị <span className="font-bold text-[#1A1C1E]">{startItem}</span> - <span className="font-bold text-[#1A1C1E]">{endItem}</span> trong tổng số <span className="font-bold text-[#1A1C1E]">{totalItems}</span> mục
      </div>

      {/* Right controls (only show buttons if totalPages > 1) */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              currentPage <= 1
                ? 'opacity-40 border-[#E4E4E0] bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-[#E4E4E0] bg-white text-[#1A1C1E] hover:bg-slate-50 hover:border-[#16324F] cursor-pointer shadow-2xs active:scale-95'
            }`}
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trước</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 font-bold select-none">
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#16324F] text-white shadow-xs'
                      : 'border border-[#E4E4E0] bg-white text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-slate-50 hover:border-[#16324F]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              currentPage >= totalPages
                ? 'opacity-40 border-[#E4E4E0] bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-[#E4E4E0] bg-white text-[#1A1C1E] hover:bg-slate-50 hover:border-[#16324F] cursor-pointer shadow-2xs active:scale-95'
            }`}
            aria-label="Trang sau"
          >
            <span>Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className,
}) => {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const totalPageNumbersWithEllipsis = siblingCount * 2 + 5;

    // Case 1: If total pages is less than the page numbers we want to show
    if (totalPageNumbersWithEllipsis >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left ellipsis, show right ellipsis
    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'ellipsis', totalPages];
    }

    // Case 3: Show left ellipsis, no right ellipsis
    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, 'ellipsis', ...rightRange];
    }

    // Case 4: Show both ellipses
    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, 'ellipsis', ...middleRange, 'ellipsis', lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* First page button */}
      {showFirstLast && (
        <PaginationButton
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 12L7 8L11 4M5 12V4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </PaginationButton>
      )}

      {/* Previous button */}
      <PaginationButton
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PaginationButton>

      {/* Page numbers */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-ink-400"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const page = pageNumber as number;
        return (
          <PaginationButton
            key={page}
            onClick={() => handlePageChange(page)}
            active={currentPage === page}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </PaginationButton>
        );
      })}

      {/* Next button */}
      <PaginationButton
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 12L10 8L6 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PaginationButton>

      {/* Last page button */}
      {showFirstLast && (
        <PaginationButton
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12L9 8L5 4M11 12V4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </PaginationButton>
      )}
    </nav>
  );
};

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PaginationButton({ className, active, disabled, children, ...props }: PaginationButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-md text-base font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        active
          ? 'bg-brand-500 text-white'
          : 'bg-bg-1 text-ink-700 border border-border hover:bg-bg-2',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-bg-1',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

Pagination.displayName = 'Pagination';

export { Pagination };

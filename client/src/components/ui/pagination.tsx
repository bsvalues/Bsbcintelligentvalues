import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

export interface PaginationProps {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  count,
  onPageChange,
  siblingCount = 1,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // siblings on each side + current + first + last
    const totalBlocks = totalNumbers + 2; // +2 for the dots

    if (count <= totalBlocks) {
      return Array.from({ length: count }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, count);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < count - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from({ length: totalNumbers }, (_, i) => i + 1);
      return [...leftRange, -1, count];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from(
        { length: totalNumbers },
        (_, i) => count - totalNumbers + i + 1
      );
      return [1, -1, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, -1, ...middleRange, -2, count];
    }

    return Array.from({ length: count }, (_, i) => i + 1);
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((pageNumber, i) => {
        if (pageNumber === -1 || pageNumber === -2) {
          return (
            <Button
              key={`ellipsis-${i}`}
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-default"
              disabled
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        
        return (
          <Button
            key={pageNumber}
            variant={page === pageNumber ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pageNumber)}
            aria-current={page === pageNumber ? 'page' : undefined}
            aria-label={`Page ${pageNumber}`}
          >
            {pageNumber}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.min(count, page + 1))}
        disabled={page === count}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
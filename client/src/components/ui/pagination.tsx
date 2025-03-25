/**
 * Pagination Component
 * 
 * A component for navigating between pages of results
 */
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
  showControls?: boolean;
  visiblePageCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  showControls = true,
  visiblePageCount = 5,
}: PaginationProps) {
  // Generate array of page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    // If totalPages is 7 or less, show all pages
    if (totalPages <= visiblePageCount + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    if (showEdges) {
      pages.push(1);
    }
    
    // Calculate start and end of visible pages
    const sidePages = Math.floor(visiblePageCount / 2);
    let startPage = Math.max(showEdges ? 2 : 1, currentPage - sidePages);
    let endPage = Math.min(showEdges ? totalPages - 1 : totalPages, startPage + visiblePageCount - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < visiblePageCount - 1) {
      startPage = Math.max(showEdges ? 2 : 1, endPage - visiblePageCount + 1);
    }
    
    // Add leading ellipsis if needed
    if (showEdges && startPage > 2) {
      pages.push('ellipsis');
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add trailing ellipsis if needed
    if (showEdges && endPage < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page
    if (showEdges) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Don't do anything if clicking current page
    if (page === currentPage) return;
    
    // Don't go beyond limits
    if (page < 1 || page > totalPages) return;
    
    // Call the provided callback
    onPageChange(page);
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous button */}
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => 
        page === 'ellipsis' ? (
          <div 
            key={`ellipsis-${index}`} 
            className="flex items-center justify-center w-9 h-9"
          >
            <MoreHorizontal className="h-4 w-4" />
          </div>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        )
      )}
      
      {/* Next button */}
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
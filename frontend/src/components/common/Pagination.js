import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPageNumbers = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = ""
}) => {
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning
    if (currentPage <= halfVisible + 1) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 1;
  const showRightEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={`pagination-container ${className}`}>
      <nav className="pagination" aria-label="Pagination">
        {/* First Page Button */}
        {showFirstLast && currentPage > 1 && (
          <button
            className="pagination-button"
            onClick={() => handlePageChange(1)}
            aria-label="Go to first page"
            type="button"
          >
            First
          </button>
        )}

        {/* Previous Button */}
        <button
          className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          type="button"
        >
          <FaChevronLeft />
        </button>

        {/* Left Ellipsis */}
        {showLeftEllipsis && (
          <span className="pagination-ellipsis">
            <FaEllipsisH />
          </span>
        )}

        {/* Page Numbers */}
        {showPageNumbers && visiblePages.map(page => (
          <button
            key={page}
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            type="button"
          >
            {page}
          </button>
        ))}

        {/* Right Ellipsis */}
        {showRightEllipsis && (
          <span className="pagination-ellipsis">
            <FaEllipsisH />
          </span>
        )}

        {/* Next Button */}
        <button
          className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          type="button"
        >
          <FaChevronRight />
        </button>

        {/* Last Page Button */}
        {showFirstLast && currentPage < totalPages && (
          <button
            className="pagination-button"
            onClick={() => handlePageChange(totalPages)}
            aria-label="Go to last page"
            type="button"
          >
            Last
          </button>
        )}
      </nav>

      {/* Page Info */}
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination; 
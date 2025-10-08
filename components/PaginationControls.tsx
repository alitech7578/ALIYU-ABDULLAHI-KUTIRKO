import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  recordsPerPage: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange, totalRecords, recordsPerPage }) => {
  const startRecord = Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords);
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm text-brand-muted border-t border-brand-primary/50">
      <div>
        Showing <span className="font-semibold text-brand-light">{startRecord}</span> to <span className="font-semibold text-brand-light">{endRecord}</span> of <span className="font-semibold text-brand-light">{totalRecords}</span> results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand-primary/50 hover:bg-brand-primary/80 disabled:bg-transparent disabled:text-brand-muted/50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <span className="font-semibold text-brand-light">{currentPage} / {totalPages}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand-primary/50 hover:bg-brand-primary/80 disabled:bg-transparent disabled:text-brand-muted/50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;

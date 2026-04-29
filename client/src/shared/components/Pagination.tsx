import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all shadow-sm"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          // Logic for skipping pages if totalPages is large could go here
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                currentPage === page
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all shadow-sm"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

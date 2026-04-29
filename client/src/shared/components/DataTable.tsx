import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Pagination } from './Pagination';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  // Pagination props
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "Tidak ada data ditemukan.",
  onRowClick,
  className,
  meta,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  const startRange = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const endRange = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className={cn("overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm flex flex-col", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]",
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Loading Data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <p className="text-slate-400 font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={cn("px-8 py-6", column.className)}>
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baris:</span>
                <div className="relative">
                  <select 
                    value={meta.limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="appearance-none bg-white border border-slate-100 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all hover:border-slate-200"
                  >
                    {[5, 10, 20, 50, 100].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
            
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan {startRange}-{endRange} dari {meta.total} data
            </div>
          </div>

          {onPageChange && meta.totalPages > 1 && (
            <Pagination 
              currentPage={meta.page} 
              totalPages={meta.totalPages} 
              onPageChange={onPageChange}
              className="sm:justify-end"
            />
          )}
        </div>
      )}
    </div>
  );
}

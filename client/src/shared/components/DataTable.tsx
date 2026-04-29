import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "Tidak ada data ditemukan.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm", className)}>
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
    </div>
  );
}

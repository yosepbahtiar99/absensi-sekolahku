import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string | number;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  variant?: 'default' | 'header';
  searchable?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Pilih opsi...',
  className,
  error,
  variant = 'default',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (!isOpen) setSearchTerm('');
  }, [isOpen, searchable]);

  return (
    <div className={cn("space-y-2 w-full", variant === 'header' ? "space-y-0" : "", className)} ref={containerRef}>
      {label && variant === 'default' && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between transition-all outline-none border-2 border-transparent",
            variant === 'default' 
              ? "p-4 bg-slate-50 rounded-2xl text-sm font-bold hover:bg-slate-100/80 focus:ring-4 focus:ring-primary/10" 
              : "p-2 px-4 bg-white border-slate-200/60 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm hover:border-primary/30",
            isOpen ? "bg-white border-primary/20 shadow-lg shadow-primary/5 ring-4 ring-primary/5" : "text-slate-700",
            error ? "border-red-200 bg-red-50" : ""
          )}
        >
          <span className={cn("truncate mr-2", !selectedOption && "text-slate-400 font-medium")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={variant === 'default' ? 18 : 14} 
            className={cn("text-slate-400 transition-transform duration-300 shrink-0", isOpen ? "rotate-180 text-primary" : "")} 
          />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-[110] w-full mt-2 bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-200 origin-top flex flex-col",
            variant === 'header' ? "w-72 right-0 rounded-[2rem] mt-3" : ""
          )}>
            {searchable && (
              <div className="p-4 pb-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-[280px] overflow-y-auto custom-scrollbar px-3 pb-4 pt-2">
              <div className="space-y-1">
                {filteredOptions.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Tidak ditemukan</p>
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value.toString());
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl text-[13px] font-bold transition-all",
                        opt.value === value 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary hover:translate-x-1"
                      )}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {opt.value === value && <Check size={16} className="shrink-0 ml-2" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-[10px] font-bold italic px-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

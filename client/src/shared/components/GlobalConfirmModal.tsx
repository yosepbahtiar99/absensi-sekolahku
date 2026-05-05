import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useConfirmStore } from '../store/confirmStore';
import { Button } from './Button';
import { cn } from '../lib/utils';

const GlobalConfirmModal = () => {
  const { isOpen, options, onConfirm, onCancel } = useConfirmStore();

  if (!isOpen) return null;

  const config = {
    danger: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      btnColor: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
      title: 'Hapus Data',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      btnColor: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
      title: 'Peringatan',
    },
    info: {
      icon: Info,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      btnColor: 'bg-primary hover:bg-primary-dark shadow-primary/20',
      title: 'Konfirmasi',
    },
  };

  const { icon: Icon, color, bgColor, btnColor, title } = config[options.variant || 'info'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
      >
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className={cn("p-4 rounded-3xl", bgColor, color)}>
            <Icon size={32} />
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
            {options.title || title}
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {options.message}
          </p>

          <div className="flex gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 rounded-2xl py-6 border-slate-100 text-slate-500 hover:bg-slate-50"
            >
              {options.cancelText}
            </Button>
            <Button 
              onClick={onConfirm}
              className={cn(
                "flex-[1.5] rounded-2xl py-6 text-white font-bold shadow-lg transition-all active:scale-95",
                btnColor
              )}
            >
              {options.confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalConfirmModal;

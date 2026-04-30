import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { cn } from '../lib/utils';

const GlobalNotification = () => {
  const { isOpen, message, type, hideNotification } = useNotificationStore();

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50/90',
      borderColor: 'border-emerald-200',
      shadowColor: 'shadow-emerald-500/10',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50/90',
      borderColor: 'border-red-200',
      shadowColor: 'shadow-red-500/10',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50/90',
      borderColor: 'border-amber-200',
      shadowColor: 'shadow-amber-500/10',
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/90',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-500/10',
    },
  };

  const { icon: Icon, color, bgColor, borderColor, shadowColor } = config[type];

  return (
    <>
      {/* Backdrop for Mobile Only */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] sm:hidden animate-in fade-in duration-300"
        onClick={hideNotification}
      />

      <div 
        className={cn(
          "fixed z-[101] transition-all duration-500 ease-out",
          // Mobile: Center
          "bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[85%] max-w-sm sm:w-auto",
          // Desktop: Bottom Left
          "sm:bottom-8 sm:left-8 sm:translate-x-0 sm:translate-y-0",
          "animate-in zoom-in-95 sm:slide-in-from-left-10 duration-300"
        )}
      >
        <div className={cn(
          "relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl shadow-2xl flex items-start gap-4",
          bgColor, borderColor, shadowColor
        )}>
          {/* Progress bar for auto-hide types */}
          {type !== 'error' && (
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full animate-shrink-x" />
          )}

          <div className={cn("p-3 rounded-2xl bg-white/50 shadow-sm", color)}>
            <Icon size={24} />
          </div>

          <div className="flex-1 pt-1">
            <h4 className={cn("font-black uppercase tracking-widest text-[10px] mb-1 opacity-60", color)}>
              {type} Notification
            </h4>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              {message}
            </p>
          </div>

          <button 
            onClick={hideNotification}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default GlobalNotification;

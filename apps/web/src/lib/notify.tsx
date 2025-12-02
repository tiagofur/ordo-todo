import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface NotifyOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContentProps {
  title: string;
  description?: React.ReactNode;
  icon: React.ElementType;
  variant: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
  action?: NotifyOptions['action'];
}

const ToastContent = ({ 
  title, 
  description, 
  icon: Icon, 
  variant, 
  onDismiss,
  action
}: ToastContentProps) => {
  const variants = {
    success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none",
    error: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-none",
    warning: "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none",
    info: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none",
  };

  return (
    <div className={cn(
      "relative flex w-full items-start gap-4 rounded-xl p-4 shadow-xl transition-all hover:scale-[1.02] cursor-default",
      variants[variant]
    )}>
      <Icon className="h-6 w-6 shrink-0 mt-0.5" strokeWidth={2.5} />
      <div className="flex-1 grid gap-1">
        {title && <h3 className="font-bold text-base leading-none tracking-tight">{title}</h3>}
        {description && <div className="text-sm opacity-90 font-medium leading-relaxed">{description}</div>}
        {action && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="mt-2 w-fit rounded-md bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute right-2 top-2 rounded-full p-1 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const notify = {
  success: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={CheckCircle2} 
        variant="success" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
  error: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={XCircle} 
        variant="error" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 5000 });
  },
  warning: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={AlertTriangle} 
        variant="warning" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
  info: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={Info} 
        variant="info" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
};

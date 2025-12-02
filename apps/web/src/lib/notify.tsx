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
  variant: 'success' | 'error' | 'warning' | 'info' | 'pomodoro' | 'short_break' | 'long_break';
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
    success: "bg-emerald-600 text-white border-none",
    error: "bg-red-600 text-white border-none",
    warning: "bg-amber-500 text-white border-none",
    info: "bg-blue-600 text-white border-none",
    pomodoro: "bg-red-600 text-white border-none",
    short_break: "bg-green-500 text-white border-none", // Light green
    long_break: "bg-green-800 text-white border-none", // Dark green
  };

  return (
    <div className={cn(
      "relative flex w-full items-start gap-4 rounded-xl p-4 shadow-xl transition-all hover:scale-[1.02] cursor-default",
      variants[variant as keyof typeof variants] || variants.info
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
            className="mt-2 w-fit rounded-md bg-white px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-100 transition-colors"
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
        className="absolute right-2 top-2 rounded-full p-1 text-white hover:bg-white hover:text-gray-900 transition-colors"
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
  pomodoro: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={CheckCircle2} 
        variant="pomodoro" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
  shortBreak: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={Info} 
        variant="short_break" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
  longBreak: (title: string, description?: React.ReactNode, options?: NotifyOptions) => {
    toast.custom((t) => (
      <ToastContent 
        title={title} 
        description={description} 
        icon={Info} 
        variant="long_break" 
        onDismiss={() => toast.dismiss(t)}
        action={options?.action}
      />
    ), { duration: options?.duration || 4000 });
  },
};

import { toast } from 'sonner';

export function useToast() {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      className: 'toast-success',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
      className: 'toast-error',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--destructive))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      className: 'toast-info',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--primary))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
      className: 'toast-warning',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--warning))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      className: 'toast-loading',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const showProgress = (message: string, progress: number, description?: string) => {
    return toast.loading(message, {
      description: `${description} (${Math.round(progress)}%)`,
      className: 'toast-progress',
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
      },
    });
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    showProgress,
    dismiss,
  };
}

'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressIndicator({ 
  progress, 
  label, 
  className,
  showPercentage = true 
}: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("inline-block", sizeClasses[size], className)}>
      <svg
        className="w-full h-full animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    </div>
  );
}

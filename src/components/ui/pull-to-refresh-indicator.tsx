'use client';

import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.5 + progress * 0.5;

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center py-4 transition-opacity"
      style={{
        opacity,
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <RefreshCw
          className={`h-6 w-6 text-primary ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${progress * 360}deg)`,
          }}
        />
      </div>
    </div>
  );
}

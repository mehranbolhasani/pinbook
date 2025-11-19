'use client';

import { useState } from 'react';
import { useDrag } from '@use-gesture/react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
}

interface UsePullToRefreshReturn {
  bind: () => ReturnType<typeof useDrag>;
  isRefreshing: boolean;
  pullDistance: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  resistance = 0.5,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const bind = useDrag(
    async ({ movement: [, my], last, cancel, event }) => {
      // Only allow pull-to-refresh when scrolled to top
      const target = event?.target as HTMLElement;
      const scrollContainer = target?.closest('[data-ptr-container]') as HTMLElement;
      
      if (scrollContainer && scrollContainer.scrollTop > 0) {
        cancel();
        return;
      }

      // Don't allow pull down if already refreshing
      if (isRefreshing) {
        cancel();
        return;
      }

      // Only respond to downward pulls
      if (my < 0) {
        cancel();
        return;
      }

      // Apply resistance to the pull
      const resistedDistance = Math.min(
        my * resistance,
        maxPullDistance
      );

      if (!last) {
        // Update pull distance during drag
        setPullDistance(resistedDistance);
      } else {
        // On release
        if (resistedDistance >= threshold) {
          // Trigger refresh
          setIsRefreshing(true);
          setPullDistance(threshold);
          
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
            setPullDistance(0);
          }
        } else {
          // Reset if threshold not met
          setPullDistance(0);
        }
      }
    },
    {
      axis: 'y',
      filterTaps: true,
      pointer: { touch: true },
    }
  );

  return {
    bind,
    isRefreshing,
    pullDistance,
  };
}

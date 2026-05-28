'use client';

import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { skeletonPulse } from '@/lib/animations';

export function BookmarkSkeleton() {
  const prefersReducedMotion = useReducedMotion();

  const skeletonContent = (
    <div className="flex items-center space-x-4 p-4 border-b border-border bg-card rounded-xl mb-3">
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );

  if (prefersReducedMotion) return skeletonContent;

  return (
    <motion.div
      animate={{ opacity: skeletonPulse.opacity }}
      transition={skeletonPulse.transition}
    >
      {skeletonContent}
    </motion.div>
  );
}

export function BookmarkListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkSkeleton key={i} />
      ))}
    </div>
  );
}

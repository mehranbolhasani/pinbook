'use client';

import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { skeletonPulse } from '@/lib/animations';

export function BookmarkSkeleton() {
  const prefersReducedMotion = useReducedMotion();

  const skeletonContent = (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-sm" />
        <Skeleton className="h-3 w-1/4 rounded-sm" />
      </div>
      <div className="flex items-center shrink-0 gap-1">
        <Skeleton className="h-6 w-6 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-sm" />
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
    <div className="flex flex-col gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkSkeleton key={i} />
      ))}
    </div>
  );
}

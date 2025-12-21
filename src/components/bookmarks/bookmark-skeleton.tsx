'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// Enhanced skeleton with shimmer effect

interface BookmarkSkeletonProps {
  layout?: 'card' | 'list' | 'minimal' | 'masonry';
}

export function BookmarkSkeleton({ layout = 'card' }: BookmarkSkeletonProps) {
  if (layout === 'minimal') {
    return (
      <div className="flex items-center space-x-3 p-3 border-b">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="flex items-center space-x-4 p-4 border-b">
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
  }

  if (layout === 'masonry') {
    return (
      <Card className="break-inside-avoid mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card layout
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookmarkListSkeleton({ 
  count = 6, 
  layout = 'card' 
}: { 
  count?: number; 
  layout?: 'card' | 'list' | 'minimal' | 'masonry';
}) {
  if (layout === 'masonry') {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <BookmarkSkeleton key={i} layout={layout} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkSkeleton key={i} layout={layout} />
      ))}
    </div>
  );
}

import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

// Lazy load heavy components
export const LazyBookmarkMasonryView = dynamic(
  () => import('@/components/bookmarks/bookmark-masonry-view').then(mod => ({ default: mod.BookmarkMasonryView })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-32 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyVirtualizedBookmarkList = dynamic(
  () => import('@/components/bookmarks/virtualized-bookmark-list').then(mod => ({ default: mod.VirtualizedBookmarkList })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyThemeCustomizer = dynamic(
  () => import('@/components/theme/theme-customizer').then(mod => ({ default: mod.ThemeCustomizer })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-64 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyKeyboardShortcutsModal = dynamic(
  () => import('@/components/ui/keyboard-shortcuts-modal').then(mod => ({ default: mod.KeyboardShortcutsModal })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-32 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyBulkActionsToolbar = dynamic(
  () => import('@/components/bookmarks/bulk-actions-toolbar').then(mod => ({ default: mod.BulkActionsToolbar })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-12 bg-muted rounded-lg' }),
    ssr: false,
  }
);

// Lazy load dialogs
export const LazyAddBookmarkDialog = dynamic(
  () => import('@/components/bookmarks/add-bookmark-dialog').then(mod => ({ default: mod.AddBookmarkDialog })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyEditBookmarkDialog = dynamic(
  () => import('@/components/bookmarks/edit-bookmark-dialog').then(mod => ({ default: mod.EditBookmarkDialog })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-muted rounded-lg' }),
    ssr: false,
  }
);

// Lazy load mobile components
export const LazyMobileBookmarkCard = dynamic(
  () => import('@/components/bookmarks/mobile-bookmark-card').then(mod => ({ default: mod.MobileBookmarkCard })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-20 bg-muted rounded-lg' }),
    ssr: false,
  }
);

export const LazyMobileNav = dynamic(
  () => import('@/components/layout/mobile-nav').then(mod => ({ default: mod.MobileNav })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-16 bg-muted rounded-lg' }),
    ssr: false,
  }
);

// Lazy load utility components
export const LazyProgressIndicator = dynamic(
  () => import('@/components/ui/progress-indicator').then(mod => ({ default: mod.ProgressIndicator })),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse h-2 bg-muted rounded' }),
    ssr: false,
  }
);

export const LazyOptimizedMotion = dynamic(
  () => import('@/components/ui/optimized-motion').then(mod => ({ default: mod.OptimizedMotion })),
  {
    loading: () => React.createElement('div'),
    ssr: false,
  }
);

// Route-based code splitting
export const LazySettingsPage = dynamic(
  () => import('@/app/settings/page'),
  {
    loading: () => React.createElement('div', { className: 'min-h-screen bg-background' }, 
      React.createElement('div', { className: 'container mx-auto px-4 py-8 max-w-4xl' },
        React.createElement('div', { className: 'animate-pulse space-y-6' }, [
          React.createElement('div', { key: 'title', className: 'h-8 bg-muted rounded w-1/3' }),
          React.createElement('div', { key: 'subtitle', className: 'h-4 bg-muted rounded w-1/2' }),
          React.createElement('div', { key: 'content', className: 'space-y-4' }, [
            React.createElement('div', { key: 'item1', className: 'h-32 bg-muted rounded' }),
            React.createElement('div', { key: 'item2', className: 'h-32 bg-muted rounded' }),
            React.createElement('div', { key: 'item3', className: 'h-32 bg-muted rounded' })
          ])
        ])
      )
    ),
    ssr: false,
  }
);

// Conditional loading based on feature flags
export function createConditionalComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  condition: () => boolean,
  fallback?: ComponentType<unknown>
) {
  return dynamic(importFn, {
    loading: () => fallback ? React.createElement(fallback) : React.createElement('div', { className: 'animate-pulse h-32 bg-muted rounded-lg' }),
    ssr: false,
  });
}

// Lazy load based on user preferences
export const LazyAdvancedFeatures = createConditionalComponent(
  () => import('@/components/advanced-features').then(mod => ({ default: mod.AdvancedFeatures })),
  () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pinbook-advanced-features') === 'true';
  }
);

// Performance monitoring for code splitting
export class CodeSplittingMonitor {
  private static instance: CodeSplittingMonitor;
  private metrics: Map<string, { loadTime: number; size: number }> = new Map();

  static getInstance(): CodeSplittingMonitor {
    if (!CodeSplittingMonitor.instance) {
      CodeSplittingMonitor.instance = new CodeSplittingMonitor();
    }
    return CodeSplittingMonitor.instance;
  }

  recordChunkLoad(chunkName: string, loadTime: number, size: number): void {
    this.metrics.set(chunkName, { loadTime, size });
    console.log(`Chunk ${chunkName} loaded in ${loadTime}ms (${size} bytes)`);
  }

  getMetrics(): Map<string, { loadTime: number; size: number }> {
    return new Map(this.metrics);
  }

  getTotalSize(): number {
    return Array.from(this.metrics.values()).reduce((total, metric) => total + metric.size, 0);
  }

  getAverageLoadTime(): number {
    const times = Array.from(this.metrics.values()).map(metric => metric.loadTime);
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
}

// Bundle analyzer integration
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    const monitor = CodeSplittingMonitor.getInstance();
    const metrics = monitor.getMetrics();
    
    console.group('📦 Bundle Analysis');
    console.log(`Total chunks: ${metrics.size}`);
    console.log(`Total size: ${(monitor.getTotalSize() / 1024).toFixed(2)} KB`);
    console.log(`Average load time: ${monitor.getAverageLoadTime().toFixed(2)}ms`);
    
    console.table(Array.from(metrics.entries()).map(([name, metric]) => ({
      chunk: name,
      size: `${(metric.size / 1024).toFixed(2)} KB`,
      loadTime: `${metric.loadTime}ms`,
    })));
    console.groupEnd();
  }
}

// Preload critical chunks
export function preloadCriticalChunks(): void {
  if (typeof window === 'undefined') return;

  // Preload essential components
  const criticalChunks = [
    '/_next/static/chunks/pages/_app.js',
    '/_next/static/chunks/pages/index.js',
  ];

  criticalChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = chunk;
    link.as = 'script';
    document.head.appendChild(link);
  });
}

// Export monitor instance
export const codeSplittingMonitor = CodeSplittingMonitor.getInstance();

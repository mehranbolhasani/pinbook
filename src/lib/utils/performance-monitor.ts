export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

export interface CoreWebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (!this.isEnabled) return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric({
              name: `navigation.${entry.name}`,
              value: entry.duration,
              timestamp: Date.now(),
              type: 'timing',
            });
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        // Silently fail
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric({
              name: `paint.${entry.name}`,
              value: entry.startTime,
              timestamp: Date.now(),
              type: 'timing',
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        // Silently fail
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric({
            name: 'lcp',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            type: 'timing',
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        // Silently fail
      }

      // Observe first input delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            this.recordMetric({
              name: 'fid',
              value: fidEntry.processingStart - fidEntry.startTime,
              timestamp: Date.now(),
              type: 'timing',
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        // Silently fail
      }
    }
  }

  // Record a custom metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

  }

  // Mark a performance milestone
  mark(name: string): void {
    if (this.isEnabled) {
      performance.mark(name);
      this.recordMetric({
        name: `mark.${name}`,
        value: performance.now(),
        timestamp: Date.now(),
        type: 'timing',
      });
    }
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark?: string): number {
    if (!this.isEnabled) return 0;

    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }

      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure ? measure.duration : 0;

      this.recordMetric({
        name: `measure.${name}`,
        value: duration,
        timestamp: Date.now(),
        type: 'timing',
      });

      return duration;
    } catch (error) {
      return 0;
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals(): CoreWebVitals {
    const vitals: CoreWebVitals = {
      FCP: 0,
      LCP: 0,
      FID: 0,
      CLS: 0,
      TTFB: 0,
    };

    if (!this.isEnabled) return vitals;

    // Get FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      vitals.FCP = fcpEntry.startTime;
    }

    // Get LCP
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      vitals.LCP = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Get FID
    const fidEntries = performance.getEntriesByType('first-input');
    if (fidEntries.length > 0) {
      const fidEntry = fidEntries[0] as PerformanceEventTiming;
      vitals.FID = fidEntry.processingStart - fidEntry.startTime;
    }

  // Get TTFB
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      vitals.TTFB = navEntry.responseStart - navEntry.requestStart;
    }

    return vitals;
  }

  // Get performance summary
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    coreWebVitals: CoreWebVitals;
    averageLoadTime: number;
    totalMetrics: number;
  } {
    const coreWebVitals = this.getCoreWebVitals();
    const timingMetrics = this.metrics.filter(m => m.type === 'timing');
    const averageLoadTime = timingMetrics.length > 0 
      ? timingMetrics.reduce((sum, m) => sum + m.value, 0) / timingMetrics.length 
      : 0;

    return {
      metrics: this.metrics,
      coreWebVitals,
      averageLoadTime,
      totalMetrics: this.metrics.length,
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    if (this.isEnabled) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  // Get average value for a metric
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  // Export metrics for analysis
  exportMetrics(): string {
    type UAData = { brands?: { brand: string; version: string }[]; platform?: string };
    const uaData = typeof navigator !== 'undefined' 
      ? (navigator as unknown as { userAgentData?: UAData }).userAgentData 
      : undefined;
    const userAgent = uaData && uaData.brands 
      ? uaData.brands.map((b) => `${b.brand}/${b.version}`).join(' ') 
      : typeof navigator !== 'undefined' 
        ? navigator.userAgent 
        : '';
    return JSON.stringify({
      timestamp: Date.now(),
      userAgent,
      metrics: this.metrics,
      coreWebVitals: this.getCoreWebVitals(),
    }, null, 2);
  }

  // Cleanup observers
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics([...monitor.getMetricsByName('')]);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [monitor]);

  return {
    metrics,
    recordMetric: monitor.recordMetric.bind(monitor),
    mark: monitor.mark.bind(monitor),
    measure: monitor.measure.bind(monitor),
    getCoreWebVitals: monitor.getCoreWebVitals.bind(monitor),
  };
}

// Performance budget checker
export class PerformanceBudget {
  private static budgets = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    TTFB: 600, // 600ms
  };

  static checkBudget(vitals: CoreWebVitals): {
    passed: boolean;
    violations: string[];
    score: number;
  } {
    const violations: string[] = [];
    let score = 100;

    if (vitals.FCP > this.budgets.FCP) {
      violations.push(`FCP: ${vitals.FCP}ms > ${this.budgets.FCP}ms`);
      score -= 20;
    }

    if (vitals.LCP > this.budgets.LCP) {
      violations.push(`LCP: ${vitals.LCP}ms > ${this.budgets.LCP}ms`);
      score -= 25;
    }

    if (vitals.FID > this.budgets.FID) {
      violations.push(`FID: ${vitals.FID}ms > ${this.budgets.FID}ms`);
      score -= 20;
    }

    if (vitals.CLS > this.budgets.CLS) {
      violations.push(`CLS: ${vitals.CLS} > ${this.budgets.CLS}`);
      score -= 15;
    }

    if (vitals.TTFB > this.budgets.TTFB) {
      violations.push(`TTFB: ${vitals.TTFB}ms > ${this.budgets.TTFB}ms`);
      score -= 20;
    }

    return {
      passed: violations.length === 0,
      violations,
      score: Math.max(0, score),
    };
  }
}

// Import React for hooks
import React from 'react';

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

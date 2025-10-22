import React from 'react';
import { indexedDBManager } from '@/lib/cache/indexeddb-manager';

export interface FaviconData {
  url: string;
  favicon: string;
  title: string;
  domain: string;
  timestamp: number;
}

export class ImageOptimization {
  private static instance: ImageOptimization;
  private faviconCache = new Map<string, FaviconData>();
  private loadingPromises = new Map<string, Promise<string>>();

  static getInstance(): ImageOptimization {
    if (!ImageOptimization.instance) {
      ImageOptimization.instance = new ImageOptimization();
    }
    return ImageOptimization.instance;
  }

  // Get favicon for a URL
  async getFavicon(url: string): Promise<string> {
    const domain = this.extractDomain(url);
    
    // Check memory cache first
    if (this.faviconCache.has(domain)) {
      const cached = this.faviconCache.get(domain)!;
      // Check if cache is still fresh (24 hours)
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        return cached.favicon;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(domain)) {
      return this.loadingPromises.get(domain)!;
    }

    // Start loading
    const loadingPromise = this.loadFavicon(url, domain);
    this.loadingPromises.set(domain, loadingPromise);

    try {
      const favicon = await loadingPromise;
      return favicon;
    } finally {
      this.loadingPromises.delete(domain);
    }
  }

  private async loadFavicon(url: string, domain: string): Promise<string> {
    try {
      // Check IndexedDB cache
      const cached = await indexedDBManager.getCache(`favicon_${domain}`);
      if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        this.faviconCache.set(domain, cached);
        return cached.favicon;
      }

      // Try multiple favicon sources
      const faviconUrls = this.generateFaviconUrls(domain);
      
      for (const faviconUrl of faviconUrls) {
        try {
          const favicon = await this.fetchFavicon(faviconUrl);
          if (favicon) {
            // Cache the result
            const faviconData: FaviconData = {
              url,
              favicon,
              title: domain,
              domain,
              timestamp: Date.now(),
            };

            this.faviconCache.set(domain, faviconData);
            await indexedDBManager.setCache(`favicon_${domain}`, faviconData, 24 * 60 * 60 * 1000);
            
            return favicon;
          }
        } catch (error) {
          console.warn(`Failed to load favicon from ${faviconUrl}:`, error);
        }
      }

      // Fallback to default favicon
      return this.getDefaultFavicon();
    } catch (error) {
      console.error('Failed to load favicon:', error);
      return this.getDefaultFavicon();
    }
  }

  private generateFaviconUrls(domain: string): string[] {
    return [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://favicons.githubusercontent.com/${domain}`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
      `https://${domain}/apple-touch-icon.png`,
    ];
  }

  private async fetchFavicon(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'force-cache',
      });

      if (response.ok) {
        return url;
      }
    } catch {
      // Try with GET request as fallback
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'force-cache',
        });

        if (response.ok) {
          return url;
        }
      } catch (getError) {
        console.warn('GET request also failed:', getError);
      }
    }

    return null;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  private getDefaultFavicon(): string {
    return '/favicon.ico'; // Default favicon
  }

  // Preload favicons for visible bookmarks
  async preloadFavicons(bookmarks: Array<{ url: string }>): Promise<void> {
    const domains = new Set(bookmarks.map(b => this.extractDomain(b.url)));
    
    // Preload up to 10 favicons to avoid overwhelming the browser
    const domainsToPreload = Array.from(domains).slice(0, 10);
    
    const preloadPromises = domainsToPreload.map(domain => 
      this.getFavicon(`https://${domain}`).catch(() => this.getDefaultFavicon())
    );

    await Promise.allSettled(preloadPromises);
  }

  // Clear favicon cache
  async clearFaviconCache(): Promise<void> {
    this.faviconCache.clear();
    
    // Clear from IndexedDB
    const keys = Array.from(this.faviconCache.keys());
    for (const key of keys) {
      await indexedDBManager.deleteCache(`favicon_${key}`);
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; domains: string[] } {
    return {
      size: this.faviconCache.size,
      domains: Array.from(this.faviconCache.keys()),
    };
  }
}

// Optimized image component
export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  lazy?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallback = '/favicon.ico',
  lazy = true 
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (lazy) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const img = document.createElement('img');
      observer.observe(img);

      return () => observer.disconnect();
    } else {
      setImageSrc(src);
    }
  }, [src, lazy]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
  };

  return React.createElement('div', { className: `relative ${className}` }, [
    isLoading && React.createElement('div', { 
      key: 'loading',
      className: 'absolute inset-0 bg-muted animate-pulse rounded' 
    }),
    React.createElement('img', {
      key: 'image',
      src: imageSrc,
      alt: alt,
      onLoad: handleLoad,
      onError: handleError,
      className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`,
      loading: lazy ? 'lazy' : 'eager'
    })
  ].filter(Boolean));
}

// Favicon component
export interface FaviconProps {
  url: string;
  className?: string;
  size?: number;
}

export function Favicon({ url, className = '', size = 16 }: FaviconProps) {
  const [favicon, setFavicon] = React.useState('/favicon.ico');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFavicon = async () => {
      try {
        const imageOptimization = ImageOptimization.getInstance();
        const faviconUrl = await imageOptimization.getFavicon(url);
        setFavicon(faviconUrl);
      } catch (error) {
        console.error('Failed to load favicon:', error);
        setFavicon('/favicon.ico');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavicon();
  }, [url]);

  return React.createElement(OptimizedImage, {
    src: favicon,
    alt: `Favicon for ${url}`,
    className: `${className} ${isLoading ? 'animate-pulse' : ''}`,
    style: { width: size, height: size },
    lazy: false
  });
}


// Export singleton instance
export const imageOptimization = ImageOptimization.getInstance();

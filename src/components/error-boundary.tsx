'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component';
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error details:', errorDetails);
    
    // Store error in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('pinbook-errors') || '[]');
      errors.push(errorDetails);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      localStorage.setItem('pinbook-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error details:', e);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      const isPageLevel = this.props.level === 'page';
      const containerClass = isPageLevel 
        ? "min-h-screen flex items-center justify-center bg-background"
        : "flex items-center justify-center p-8 bg-muted/50 rounded-lg border border-destructive/20";

      return (
        <div className={containerClass}>
          <div className={`${isPageLevel ? 'max-w-md mx-auto' : 'max-w-sm'} text-center p-6`}>
            <div className="mb-4">
              <AlertTriangle className={`${isPageLevel ? 'h-12 w-12' : 'h-8 w-8'} text-destructive mx-auto`} />
            </div>
            <h2 className={`${isPageLevel ? 'text-xl' : 'text-lg'} font-semibold mb-2`}>
              {isPageLevel ? 'Something went wrong' : 'Component Error'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isPageLevel 
                ? 'An unexpected error occurred. Please try refreshing the page.'
                : 'This component encountered an error and couldn\'t render properly.'
              }
            </p>
            
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error details {this.state.errorId && `(ID: ${this.state.errorId})`}
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack trace:'}
                      {'\n' + this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="space-x-2">
              <Button onClick={this.resetError} variant="outline" size={isPageLevel ? 'default' : 'sm'}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              {isPageLevel && (
                <>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Link href="/">
                    <Button variant="outline">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Store error for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('pinbook-errors') || '[]');
      errors.push({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      localStorage.setItem('pinbook-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error details:', e);
    }
  };
}

// Specialized error boundaries for different components
export function BookmarkListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary 
      level="component"
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border border-destructive/20">
          <Bug className="h-8 w-8 text-destructive mb-2" />
          <h3 className="font-semibold mb-2">Bookmark List Error</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Failed to load bookmarks. This might be a temporary issue.
          </p>
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function SettingsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary 
      level="component"
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border border-destructive/20">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="font-semibold mb-2">Settings Error</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Failed to load settings. Please try again.
          </p>
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

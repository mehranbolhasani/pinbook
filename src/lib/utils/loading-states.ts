export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

export class LoadingStateManager {
  private static instance: LoadingStateManager;
  private states: Map<string, LoadingState> = new Map();
  private listeners: Set<(states: Map<string, LoadingState>) => void> = new Set();

  private constructor() {}

  static getInstance(): LoadingStateManager {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager();
    }
    return LoadingStateManager.instance;
  }

  setLoading(key: string, state: LoadingState): void {
    this.states.set(key, state);
    this.notifyListeners();
  }

  setProgress(key: string, progress: number, message?: string): void {
    const currentState = this.states.get(key);
    if (currentState) {
      this.states.set(key, {
        ...currentState,
        progress,
        message,
        error: undefined
      });
      this.notifyListeners();
    }
  }

  setError(key: string, error: string): void {
    const currentState = this.states.get(key);
    if (currentState) {
      this.states.set(key, {
        ...currentState,
        isLoading: false,
        error,
        progress: undefined
      });
      this.notifyListeners();
    }
  }

  setComplete(key: string, message?: string): void {
    this.states.set(key, {
      isLoading: false,
      progress: 100,
      message,
      error: undefined
    });
    this.notifyListeners();
  }

  clear(key: string): void {
    this.states.delete(key);
    this.notifyListeners();
  }

  getState(key: string): LoadingState | undefined {
    return this.states.get(key);
  }

  getAllStates(): Map<string, LoadingState> {
    return new Map(this.states);
  }

  subscribe(listener: (states: Map<string, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.states));
  }

  // Helper methods for common operations
  startOperation(key: string, message: string): void {
    this.setLoading(key, {
      isLoading: true,
      progress: 0,
      message
    });
  }

  updateProgress(key: string, progress: number, message?: string): void {
    this.setProgress(key, progress, message);
  }

  completeOperation(key: string, message?: string): void {
    this.setComplete(key, message);
    // Auto-clear after 2 seconds
    setTimeout(() => this.clear(key), 2000);
  }

  failOperation(key: string, error: string): void {
    this.setError(key, error);
    // Auto-clear after 5 seconds
    setTimeout(() => this.clear(key), 5000);
  }
}

// Export singleton instance
export const loadingStateManager = LoadingStateManager.getInstance();

// React hook for using loading states
export function useLoadingState(key: string) {
  const [state, setState] = React.useState<LoadingState | undefined>(
    loadingStateManager.getState(key)
  );

  React.useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((states) => {
      setState(states.get(key));
    });

    return unsubscribe;
  }, [key]);

  return state;
}

// Optimistic update helpers
export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  originalData?: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export class OptimisticUpdateManager<T> {
  private updates: Map<string, OptimisticUpdate<T>> = new Map();
  private listeners: Set<(updates: Map<string, OptimisticUpdate<T>>) => void> = new Set();

  addUpdate(id: string, data: T, originalData?: T): void {
    const update: OptimisticUpdate<T> = {
      id,
      data,
      originalData,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.updates.set(id, update);
    this.notifyListeners();
  }

  markSuccess(id: string): void {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'success';
      this.updates.set(id, update);
      this.notifyListeners();
      
      // Remove after 2 seconds
      setTimeout(() => this.removeUpdate(id), 2000);
    }
  }

  markError(id: string, error: string): void {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'error';
      update.error = error;
      this.updates.set(id, update);
      this.notifyListeners();
      
      // Remove after 5 seconds
      setTimeout(() => this.removeUpdate(id), 5000);
    }
  }

  removeUpdate(id: string): void {
    this.updates.delete(id);
    this.notifyListeners();
  }

  getUpdates(): Map<string, OptimisticUpdate<T>> {
    return new Map(this.updates);
  }

  subscribe(listener: (updates: Map<string, OptimisticUpdate<T>>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.updates));
  }
}

// Import React for the hook
import React from 'react';

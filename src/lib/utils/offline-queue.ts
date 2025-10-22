export interface QueuedAction {
  id: string;
  type: 'add' | 'update' | 'delete' | 'mark_read' | 'mark_shared';
  data: unknown;
  timestamp: number;
  retries: number;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedAction[] = [];
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.loadQueue();
    this.setupEventListeners();
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem('pinbook-offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem('pinbook-offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }

  addAction(type: QueuedAction['type'], data: unknown): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const action: QueuedAction = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(action);
    this.saveQueue();

    // If online, try to process immediately
    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const actionsToProcess = [...this.queue];
    const processedActions: string[] = [];

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action);
        processedActions.push(action.id);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        
        // Increment retry count
        action.retries++;
        
        // Remove action if it has failed too many times
        if (action.retries >= 3) {
          console.warn(`Removing action ${action.id} after ${action.retries} failures`);
          processedActions.push(action.id);
        }
      }
    }

    // Remove processed actions from queue
    this.queue = this.queue.filter(action => !processedActions.includes(action.id));
    this.saveQueue();
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    // This would be implemented to call the appropriate API method
    // For now, we'll just simulate the action
    console.log(`Executing ${action.type} action:`, action.data);
    
    // In a real implementation, you would call the appropriate API method here
    // based on the action type
  }

  getQueueStatus(): { count: number; actions: QueuedAction[] } {
    return {
      count: this.queue.length,
      actions: [...this.queue]
    };
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  removeAction(id: string): boolean {
    const index = this.queue.findIndex(action => action.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      return true;
    }
    return false;
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

// Export singleton instance
export const offlineQueue = OfflineQueue.getInstance();

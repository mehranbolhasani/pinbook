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
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }
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
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueue(): void {
    if (typeof window === 'undefined') {
      this.queue = [];
      return;
    }
    try {
      const stored = localStorage.getItem('pinbook-offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem('pinbook-offline-queue', JSON.stringify(this.queue));
    } catch {
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
      } catch {
        // Increment retry count
        action.retries++;
        
        // Remove action if it has failed too many times
        if (action.retries >= 3) {
          processedActions.push(action.id);
        }
      }
    }

    // Remove processed actions from queue
    this.queue = this.queue.filter(action => !processedActions.includes(action.id));
    this.saveQueue();
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = localStorage.getItem('pinbook-auth');
    if (!stored) {
      throw new Error('Missing authentication for offline processing');
    }

    let apiToken: string | null = null;
    try {
      const parsed = JSON.parse(stored);
      apiToken = parsed?.state?.apiToken || parsed?.apiToken || null;
    } catch {
      apiToken = null;
    }

    if (!apiToken) {
      throw new Error('Missing API token for offline processing');
    }

    const api = getPinboardAPI(apiToken);
    if (!api) {
      throw new Error('Failed to initialize API client for offline processing');
    }

    switch (action.type) {
      case 'delete': {
        const data = action.data as { url: string };
        await api.deleteBookmark(data.url);
        break;
      }
      case 'add': {
        const data = action.data as AddBookmarkParams;
        await api.addBookmark(data);
        break;
      }
      case 'mark_read': {
        const data = action.data as { hash: string; isRead: boolean; bookmarkData?: Bookmark };
        await api.updateBookmarkReadStatus(data.hash, data.isRead, data.bookmarkData);
        break;
      }
      case 'mark_shared': {
        const data = action.data as { hash: string; isShared: boolean; bookmarkData?: Bookmark };
        await api.updateBookmarkShareStatus(data.hash, data.isShared, data.bookmarkData);
        break;
      }
      default:
        break;
    }
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
import { getPinboardAPI } from '@/lib/api/pinboard';
import { AddBookmarkParams, Bookmark } from '@/types/pinboard';

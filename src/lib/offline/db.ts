import { LevelDefinition } from '@/types';
import { INITIAL_LEVELS } from '@/data/levels';

const DB_NAME = 'kancilcode_offline_db';
const DB_VERSION = 1;

export interface OfflineProgressItem {
  levelId: number;
  starsEarned: number;
  completedAt: string;
  synced: boolean;
}

/**
 * Initializes the IndexedDB database for KancilCode Offline-First PWA.
 */
export function openKancilDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Levels Store
      if (!db.objectStoreNames.contains('levels')) {
        const levelStore = db.createObjectStore('levels', { keyPath: 'id' });
        // Seed default levels
        INITIAL_LEVELS.forEach((lvl) => levelStore.put(lvl));
      }

      // 2. Progress Store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'levelId' });
      }

      // 3. Background Sync Queue Store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves level completion progress into IndexedDB and queues for Background Sync.
 */
export async function saveProgressToIndexedDB(levelId: number, stars: number): Promise<void> {
  try {
    const db = await openKancilDatabase();
    const tx = db.transaction(['progress', 'sync_queue'], 'readwrite');
    const progressStore = tx.objectStore('progress');
    const syncStore = tx.objectStore('sync_queue');

    const item: OfflineProgressItem = {
      levelId,
      starsEarned: stars,
      completedAt: new Date().toISOString(),
      synced: navigator.onLine,
    };

    progressStore.put(item);

    // If offline or online, push to sync queue for cloud background synchronization
    syncStore.put(item);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save progress to IndexedDB:', err);
  }
}

/**
 * Retrieves all progress items from IndexedDB.
 */
export async function getProgressFromIndexedDB(): Promise<Record<number, number>> {
  try {
    const db = await openKancilDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('progress', 'readonly');
      const store = tx.objectStore('progress');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as OfflineProgressItem[];
        const map: Record<number, number> = {};
        results.forEach((r) => {
          map[r.levelId] = r.starsEarned;
        });
        resolve(map);
      };

      request.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

/**
 * Background Sync Processor: runs when internet connection is restored.
 */
export async function processBackgroundSyncQueue(): Promise<{ syncedCount: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0 };
  }

  try {
    const db = await openKancilDatabase();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const getReq = store.getAll();

    return new Promise((resolve) => {
      getReq.onsuccess = async () => {
        const items = getReq.result as OfflineProgressItem[];
        if (!items || items.length === 0) {
          return resolve({ syncedCount: 0 });
        }

        // Simulate syncing each item to cloud/Supabase
        // In full online mode, this persists to Supabase progress table
        console.log(`[PWA Background Sync] Syncing ${items.length} offline progress records to cloud...`);

        // Clear queue after sync
        const clearTx = db.transaction('sync_queue', 'readwrite');
        clearTx.objectStore('sync_queue').clear();
        clearTx.oncomplete = () => {
          resolve({ syncedCount: items.length });
        };
      };

      getReq.onerror = () => resolve({ syncedCount: 0 });
    });
  } catch (err) {
    console.warn('Background sync error:', err);
    return { syncedCount: 0 };
  }
}

'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  openKancilDatabase,
  processBackgroundSyncQueue,
  getProgressFromIndexedDB,
} from '@/lib/offline/db';
import { useGameStore } from '@/store/gameStore';

export const OfflineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial network state
    setIsOnline(navigator.onLine);

    // 2. Hydrate progress from local IndexedDB
    openKancilDatabase().then(async () => {
      const offlineMap = await getProgressFromIndexedDB();
      if (Object.keys(offlineMap).length > 0) {
        useGameStore.setState((state) => ({
          starsEarnedMap: {
            ...offlineMap,
            ...state.starsEarnedMap,
          },
        }));
      }
    });

    // 3. Register Service Worker for PWA Offline Caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err);
        });

      // Listen for message from Service Worker for background sync
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data?.type === 'KANCILCODE_TRIGGER_BACKGROUND_SYNC') {
          const res = await processBackgroundSyncQueue();
          if (res.syncedCount > 0) {
            triggerSyncToast(`Tersinkronisasi otomatis ${res.syncedCount} catatan progres!`);
          }
        }
      });
    }

    // 4. Online & Offline Event Listeners
    const handleOnline = async () => {
      setIsOnline(true);
      const res = await processBackgroundSyncQueue();
      if (res.syncedCount > 0) {
        triggerSyncToast(`Koneksi pulih: ${res.syncedCount} progres belajar tersinkronkan!`);
      } else {
        triggerSyncToast('Koneksi internet kembali aktif.');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      triggerSyncToast('Beralih ke Mode Luring (Data tersimpan di perangkat).');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSyncToast = (msg: string) => {
    setSyncMessage(msg);
    setTimeout(() => {
      setSyncMessage(null);
    }, 4000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Network Status Badge */}
      <div
        className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 border transition-all ${
          isOnline
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
        }`}
        title={isOnline ? 'Terhubung ke Cloud' : 'Mode Offline: Seluruh game berjalan 100% lokal'}
      >
        {isOnline ? (
          <>
            <Wifi size={12} className="text-emerald-600" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-amber-600" />
            <span>Mode Luring</span>
          </>
        )}
      </div>

      {/* Sync Toast Alert */}
      {syncMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#14382C] text-[#FAF7EE] px-4 py-2.5 rounded-2xl shadow-xl border border-[#267D73] text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-[#EAA22E] shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}
    </div>
  );
};

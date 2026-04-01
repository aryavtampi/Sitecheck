'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useCheckpointStore } from '@/stores/checkpoint-store';

/**
 * Centralized Supabase Realtime subscription manager.
 * Subscribes to notifications and checkpoints tables on mount,
 * and cleans up subscriptions on unmount.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Subscribe to real-time updates for notifications and checkpoints
    const unsubNotifications = useNotificationStore.getState().subscribeRealtime();
    const unsubCheckpoints = useCheckpointStore.getState().subscribeRealtime();

    return () => {
      unsubNotifications();
      unsubCheckpoints();
    };
  }, []);

  return <>{children}</>;
}

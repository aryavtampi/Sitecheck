import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 'NOTIF-001',
      type: 'alert',
      title: 'Storm System Approaching',
      message: 'Heavy rain forecasted for April 2. Pre-storm inspection required within 48 hours.',
      timestamp: '2026-03-29T08:00:00Z',
      read: false,
      link: '/weather',
    },
    {
      id: 'NOTIF-002',
      type: 'warning',
      title: 'Deficiency DEF-001: 72-Hour Deadline',
      message: 'Sediment basin SC-3 corrective action deadline approaching. 60 hours remaining.',
      timestamp: '2026-03-29T06:23:00Z',
      read: false,
      link: '/checkpoints/SC-3',
    },
    {
      id: 'NOTIF-003',
      type: 'warning',
      title: 'Deficiency DEF-002: Urgent',
      message: 'Concrete washout MM-4 overflow requires immediate attention. 36 hours remaining.',
      timestamp: '2026-03-29T02:45:00Z',
      read: false,
      link: '/checkpoints/MM-4',
    },
  ],
  unreadCount: 3,
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  module?: string;
  href?: string;
};

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Leave Request Approved',
    message: 'Your annual leave for Oct 1-3 has been approved by your manager.',
    type: 'success',
    read: false,
    createdAt: '2026-09-22T08:30:00Z',
    module: 'leave',
    href: '/leave/history',
  },
  {
    id: '2',
    title: 'Payroll Processing',
    message: 'September payroll is currently being processed. Expected completion by Sep 25.',
    type: 'info',
    read: false,
    createdAt: '2026-09-22T09:00:00Z',
    module: 'payroll',
    href: '/payroll',
  },
  {
    id: '3',
    title: 'Document Expiring Soon',
    message: 'Your work permit expires in 30 days. Please renew before Oct 22.',
    type: 'warning',
    read: false,
    createdAt: '2026-09-21T14:15:00Z',
    module: 'documents',
    href: '/documents',
  },
  {
    id: '4',
    title: 'Clock-in Reminder',
    message: 'You have not clocked in today. Click here to log your attendance.',
    type: 'warning',
    read: false,
    createdAt: '2026-09-22T07:00:00Z',
    module: 'attendance',
    href: '/attendance',
  },
  {
    id: '5',
    title: 'Payslip Available',
    message: 'Your August 2026 payslip is now available for download.',
    type: 'info',
    read: true,
    createdAt: '2026-09-20T10:00:00Z',
    module: 'payroll',
    href: '/payroll/payslips',
  },
  {
    id: '6',
    title: 'Leave Balance Low',
    message: 'You have 2 annual leave days remaining for this year.',
    type: 'warning',
    read: true,
    createdAt: '2026-09-19T11:30:00Z',
    module: 'leave',
    href: '/leave/balance',
  },
  {
    id: '7',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sep 28 from 02:00-04:00 UTC. Some features may be unavailable.',
    type: 'error',
    read: false,
    createdAt: '2026-09-18T16:00:00Z',
    module: undefined,
    href: undefined,
  },
];

let idCounter = 100;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...n,
        id: String(++idCounter),
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      dismissNotification,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addNotification, dismissNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

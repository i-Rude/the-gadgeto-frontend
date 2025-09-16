'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { pusher } from '@/app/lib/services/pusher';

type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to the admin-notifications channel
    const adminChannel = pusher.subscribe('admin-notifications');
    const sellerChannel = pusher.subscribe('seller-notifications');

    // Handle admin notifications
    adminChannel.bind('new-registration', (data: any) => {
      addNotification({
        message: `New registration: ${data.message}`,
        type: 'info'
      });
    });

    // Handle seller notifications
    sellerChannel.bind('new-order', (data: any) => {
      addNotification({
        message: `New order received: ${data.message}`,
        type: 'success'
      });
    });

    // Cleanup subscriptions on unmount
    return () => {
      adminChannel.unbind_all();
      sellerChannel.unbind_all();
      pusher.unsubscribe('admin-notifications');
      pusher.unsubscribe('seller-notifications');
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2),
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
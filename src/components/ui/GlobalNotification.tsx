'use client';

import React, { useEffect } from 'react';
import { useNotification } from './NotificationProvider';
import { Notification } from '@/app/peer-support/components/Notification';

export const GlobalNotification: React.FC = () => {
  const { notification, closeNotification } = useNotification();

  useEffect(() => {
    if (!notification) return;
    if (notification.duration === 0) return;
    const timer = setTimeout(() => {
      closeNotification();
    }, notification.duration || 5000);
    return () => clearTimeout(timer);
  }, [notification, closeNotification]);

  if (!notification) return null;

  return (
    <Notification
      type={notification.type}
      message={notification.message}
      duration={notification.duration}
      onClose={closeNotification}
    />
  );
};
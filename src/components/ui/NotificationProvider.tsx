'use client';

 import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
 import { supabase } from '@/lib/supabase';
 
export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextProps {
  notification: NotificationState | null;
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((type: NotificationType, message: string, duration = 5000) => {
    setNotification({ type, message, duration });
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);
 
   // Global Supabase Realtime subscriptions for notifications
   useEffect(() => {
     let supportRequestsChannel: any;
     let chatChannel: any;
     let userId: string | null = null;
     let unsubAuth: any;
 
     const setup = async () => {
       // Get current user
       const { data: { session } } = await supabase.auth.getSession();
       userId = session?.user?.id || null;
       if (!userId) return;
 
       // Support Requests
       supportRequestsChannel = supabase
         .channel('global_support_requests_notifications')
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'support_requests',
         }, (payload) => {
           if (payload.new.receiver_id === userId) {
             showNotification('info', 'You have received a new support request.');
           }
         })
         .subscribe();
 
       // Peer Chat
       chatChannel = supabase
         .channel('global_peer_chat_notifications')
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'peer_support_chats',
         }, (payload) => {
           if (payload.new.receiver_id === userId) {
             showNotification('info', 'You have a new chat message.');
           }
         })
         .subscribe();
     };
 
     setup();
 
     // Listen for auth changes to re-subscribe if user changes
     unsubAuth = supabase.auth.onAuthStateChange((_event, session) => {
       userId = session?.user?.id || null;
       // Unsubscribe and re-setup
       if (supportRequestsChannel) supportRequestsChannel.unsubscribe();
       if (chatChannel) chatChannel.unsubscribe();
       setup();
     });
 
     return () => {
       if (supportRequestsChannel) supportRequestsChannel.unsubscribe();
       if (chatChannel) chatChannel.unsubscribe();
       if (unsubAuth) unsubAuth.data?.subscription?.unsubscribe();
     };
   }, [showNotification]);
 
  return (
    <NotificationContext.Provider value={{ notification, showNotification, closeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

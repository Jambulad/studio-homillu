
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, arrayUnion } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';

export function NotificationSetup() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const { messaging } = initializeFirebase();
          if (!messaging) return;

          const token = await getToken(messaging, {
            vapidKey: 'BIsy6I7S_9n4X6zG8z6Y5f4y3X2W1V0U9T8S7R6Q5P4O3N2M1L0K9J8I7H6G5F4E3D2C1B0A' // Simulated VAPID Key
          });

          if (token) {
            const userRef = doc(firestore, 'users', user.uid);
            updateDocumentNonBlocking(userRef, {
              fcmTokens: arrayUnion(token)
            });
            console.log('FCM Token registered:', token);
          }

          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            toast({
              title: payload.notification?.title || 'Family Hub Alert',
              description: payload.notification?.body || 'New update from your family.',
            });
          });
        }
      } catch (error) {
        console.error('Notification Setup Error:', error);
      }
    };

    setupNotifications();
  }, [user, firestore, toast]);

  return null;
}

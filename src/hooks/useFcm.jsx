import { useState, useCallback } from 'react';
import { messaging, getToken, onMessage } from '../firebase/firebaseConfig';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const useFcm = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      if (!('Notification' in window)) {
        console.error('This browser does not support notifications');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get FCM Token
        const currentToken = await getToken(messaging, {
          vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // Optional but recommended for Web
        });

        if (currentToken) {
          setToken(currentToken);
          
          // Send token to backend
          await api.post('/api/auth/fcm-token', { fcmToken: currentToken });
          console.log('✅ FCM Token saved to backend');
          return currentToken;
        } else {
          console.warn('No registration token available. Request permission to generate one.');
        }
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const setupOnMessage = useCallback(() => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      toast.success(
        (t) => (
          <div onClick={() => { toast.dismiss(t.id); window.location.href = payload.data?.url || '/my-orders'; }}>
            <p className="font-bold">{payload.notification.title}</p>
            <p className="text-sm">{payload.notification.body}</p>
          </div>
        ),
        { duration: 6000, icon: '🔔' }
      );
    });
  }, []);

  return { requestPermission, setupOnMessage, token, loading };
};

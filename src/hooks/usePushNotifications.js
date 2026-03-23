import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  // Check support and permission on mount
  useEffect(() => {
    if (isPushSupported()) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check existing subscription
      checkExistingSubscription();
    } else {
      setIsSupported(false);
    }
  }, []);

  // Check if user already has a push subscription
  const checkExistingSubscription = async () => {
    try {
      if (!navigator.serviceWorker.ready) return;
      
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      
      if (existingSub) {
        setSubscription(existingSub);
        console.log('[Push] Existing subscription found:', existingSub.endpoint);
      }
      
      // Get server-side subscription count
      await fetchSubscriptionCount();
    } catch (err) {
      console.error('[Push] Error checking subscription:', err);
    }
  };

  // Get subscription count from server
  const fetchSubscriptionCount = async () => {
    try {
      const response = await api.get('/api/notifications/subscriptions');
      if (response.data.success) {
        setSubscriptionCount(response.data.count);
      }
    } catch (err) {
      console.error('[Push] Error fetching subscription count:', err);
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await Notification.requestPermission();
      setPermission(result);
      
      console.log('[Push] Permission result:', result);
      
      if (result === 'granted') {
        return true;
      } else if (result === 'denied') {
        setError('Notification permission denied. Please enable notifications in browser settings.');
        return false;
      }
      
      return false;
    } catch (err) {
      setError('Error requesting permission: ' + err.message);
      console.error('[Push] Permission error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check permission first
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Notification permission not granted');
        }
      }
      
      // Get VAPID public key from server
      const vapidResponse = await api.get('/api/notifications/vapid-public-key');
      
      if (!vapidResponse.data.success || !vapidResponse.data.publicKey) {
        throw new Error('Push notifications not configured on server');
      }
      
      const vapidPublicKey = vapidResponse.data.publicKey;
      console.log('[Push] Got VAPID public key');
      
      // Wait for service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] Service worker ready');
      
      // Subscribe
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      console.log('[Push] Push subscription created:', pushSubscription.endpoint);
      
      // Send subscription to server
      const response = await api.post('/api/notifications/subscribe', {
        subscription: {
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: pushSubscription.toJSON().keys.p256dh,
            auth: pushSubscription.toJSON().keys.auth
          },
          expirationTime: pushSubscription.expirationTime
        }
      });
      
      if (response.data.success) {
        setSubscription(pushSubscription);
        await fetchSubscriptionCount();
        console.log('[Push] Subscription saved to server');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to save subscription');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Subscription failed';
      setError(errorMessage);
      console.error('[Push] Subscribe error:', err);
      
      // If permission denied, update permission state
      if (err.message.includes('permission') || err.message.includes('denied')) {
        setPermission('denied');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }
      
      // Unsubscribe from server
      await api.post('/api/notifications/unsubscribe', {
        endpoint: subscription.endpoint
      });
      
      // Unsubscribe locally
      await subscription.unsubscribe();
      
      setSubscription(null);
      await fetchSubscriptionCount();
      
      console.log('[Push] Unsubscribed successfully');
      return true;
    } catch (err) {
      setError(err.message || 'Unsubscribe failed');
      console.error('[Push] Unsubscribe error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Test notification
  const testNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/notifications/test');
      
      if (response.data.success) {
        console.log('[Push] Test notification sent:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Test failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('[Push] Test error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh subscription count
  const refreshSubscriptions = useCallback(async () => {
    await fetchSubscriptionCount();
  }, []);

  // Manual permission check
  const checkPermission = useCallback(() => {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
  }, []);

  return {
    isSupported,
    permission,
    subscription,
    loading,
    error,
    subscriptionCount,
    subscribe,
    unsubscribe,
    requestPermission,
    testNotification,
    checkPermission,
    refreshSubscriptions,
    hasSubscription: !!subscription
  };
};

export default usePushNotifications;

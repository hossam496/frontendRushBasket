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
      console.log('[Push] Checking existing subscription...');
      
      // Wait for service worker to be ready with timeout
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service worker registration timeout')), 5000)
        )
      ]);
      
      console.log('[Push] Service worker registration:', registration.scope);
      
      const existingSub = await registration.pushManager.getSubscription();
      
      if (existingSub) {
        setSubscription(existingSub);
        console.log('[Push] Existing subscription found:', existingSub.endpoint);
      } else {
        console.log('[Push] No existing subscription found');
      }
      
      // Get server-side subscription count
      await fetchSubscriptionCount();
    } catch (err) {
      console.error('[Push] Error checking subscription:', err.message);
      // Don't set error state here - this is just an initialization check
      if (err.message.includes('Service worker')) {
        console.log('[Push] Service worker not ready yet, will retry');
      }
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
      console.log('[Push] Starting subscription process...');
      setLoading(true);
      setError(null);
      
      // Check permission first
      if (Notification.permission !== 'granted') {
        console.log('[Push] Requesting notification permission...');
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Notification permission not granted');
        }
      }
      
      console.log('[Push] Getting VAPID public key from server...');
      
      // Get VAPID public key from server with timeout
      let vapidResponse;
      try {
        vapidResponse = await Promise.race([
          api.get('/api/notifications/vapid-public-key'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('VAPID key fetch timeout')), 10000)
          )
        ]);
      } catch (err) {
        console.error('[Push] VAPID fetch error:', err.message);
        throw new Error('Unable to get VAPID key - service may be unavailable');
      }
      
      if (!vapidResponse.data.success || !vapidResponse.data.publicKey) {
        console.error('[Push] VAPID response:', vapidResponse.data);
        throw new Error('Push notifications not configured on server');
      }
      
      const vapidPublicKey = vapidResponse.data.publicKey;
      console.log('[Push] Got VAPID public key:', vapidPublicKey.substring(0, 30) + '...');
      
      console.log('[Push] Waiting for service worker...');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service worker timeout')), 10000)
        )
      ]);
      
      console.log('[Push] Service worker ready:', registration.scope);
      
      console.log('[Push] Creating push subscription...');
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey.trim())
      });
      
      console.log('[Push] Push subscription created:', pushSubscription.endpoint);
      console.log('[Push] Sending subscription to server...');

      const response = await Promise.race([
        api.post('/api/notifications/subscribe', {
          subscription: {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: pushSubscription.toJSON().keys.p256dh,
              auth: pushSubscription.toJSON().keys.auth
            },
            expirationTime: pushSubscription.expirationTime
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Subscription save timeout')), 15000)
        )
      ]);
      
      console.log('[Push] Server response:', response.data);
      
      if (response.data.success) {
        setSubscription(pushSubscription);
        await fetchSubscriptionCount();
        console.log('[Push] ✅ Subscription saved successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to save subscription');
      }
    } catch (err) {
      console.error('[Push] ❌ Subscribe error:', err);
      
      let errorMessage = err.response?.data?.message || err.message || 'Unknown push service error';
      
      if (errorMessage.includes('VAPID') || errorMessage.includes('configured')) {
        errorMessage = 'Push service not configured on server. Please check environment variables.';
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Notification permission denied. Please enable in browser settings.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your network and try again.';
      }
      
      setError(errorMessage);
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
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

import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { FaBell, FaBellSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const PushNotificationToggle = () => {
  const {
    isSupported,
    permission,
    loading,
    error,
    subscriptionCount,
    subscribe,
    unsubscribe,
    testNotification,
    hasSubscription
  } = usePushNotifications();

  const [showTestSuccess, setShowTestSuccess] = useState(false);

  // Handle subscribe/unsubscribe toggle
  const handleToggle = async () => {
    if (hasSubscription) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Handle test notification
  const handleTest = async () => {
    const result = await testNotification();
    if (result) {
      setShowTestSuccess(true);
      setTimeout(() => setShowTestSuccess(false), 3000);
    }
  };

  // Not supported
  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-500">
          <FaBellSlash className="mr-2" />
          <span className="text-sm">Push notifications not supported in this browser</span>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center text-red-700 mb-2">
          <FaExclamationTriangle className="mr-2" />
          <span className="font-medium">Notifications Blocked</span>
        </div>
        <p className="text-sm text-red-600">
          Please enable notifications in your browser settings to receive order alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${hasSubscription ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <FaBell size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">
              {hasSubscription 
                ? `Active on ${subscriptionCount} device(s)` 
                : 'Get notified when new orders arrive'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            hasSubscription
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : hasSubscription ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Test notification button */}
      {hasSubscription && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Test if notifications are working
          </p>
          <div className="flex items-center">
            {showTestSuccess && (
              <span className="mr-3 text-sm text-green-600 flex items-center">
                <FaCheck className="mr-1" /> Sent!
              </span>
            )}
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Test Notification'}
            </button>
          </div>
        </div>
      )}

      {/* Info text */}
      <p className="mt-3 text-xs text-gray-400">
        Note: You must keep the browser installed to receive notifications when the site is closed.
      </p>
    </div>
  );
};

export default PushNotificationToggle;

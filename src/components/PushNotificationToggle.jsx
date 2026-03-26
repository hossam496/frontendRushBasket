import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { FaBell, FaBellSlash, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

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
    hasSubscription,
    refreshSubscriptions
  } = usePushNotifications();

  const [showTestSuccess, setShowTestSuccess] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  // Handle subscribe/unsubscribe toggle
  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (hasSubscription) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setIsToggling(false);
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

  const isLoading = loading || isToggling;

  // Not supported
  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-500">
          <FaBellSlash className="mr-2" />
          <span className="text-sm">Push notifications not supported in this browser</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Please use a modern browser like Chrome, Firefox, or Edge.
        </p>
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
        <button
          onClick={() => {
            // Show instructions for enabling notifications
            if (window.chrome) {
              alert('To enable notifications:\n1. Click the lock/info icon in address bar\n2. Find "Notifications" setting\n3. Change to "Allow"');
            } else {
              alert('Please check your browser settings to enable notifications for this site.');
            }
          }}
          className="mt-2 text-xs text-red-700 underline hover:text-red-800"
        >
          How to enable?
        </button>
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
            <p className="text-sm text-gray-400">
              {hasSubscription 
                ? `Active on ${subscriptionCount} device(s)` 
                : 'Get real-time updates for your orders'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            hasSubscription
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <FaSpinner className="animate-spin mr-2" size={14} />
              Processing...
            </span>
          ) : hasSubscription ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-200">
          <strong>Error:</strong> {error}
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
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Test Notification'}
            </button>
          </div>
        </div>
      )}

      {/* Info text */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {hasSubscription ? (
            '✓ You will receive notifications for order status changes and important updates.'
          ) : (
            '💡 Enable notifications to get instant alerts when your order status is updated.'
          )}
        </p>
        {hasSubscription && (
          <p className="text-xs text-gray-400 mt-1">
            Note: Keep your browser installed to receive notifications even when the site is closed.
          </p>
        )}
      </div>
    </div>
  );
};

export default PushNotificationToggle;
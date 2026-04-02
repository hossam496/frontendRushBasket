import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { FaBell, FaBellSlash, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleTest = async () => {
    const result = await testNotification();
    if (result) {
      setShowTestSuccess(true);
      setTimeout(() => setShowTestSuccess(false), 3000);
    }
  };

  const isLoading = loading || isToggling;

  if (!isSupported) {
    return (
      <div className="p-5 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10">
        <div className="flex items-center text-slate-400">
          <FaBellSlash className="mr-3 text-rose-400" size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">Web Push Unsupported</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Please use a modern browser like Chrome or Edge for background alerts.
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-5 bg-rose-500/5 backdrop-blur-xl rounded-2xl border border-rose-500/20">
        <div className="flex items-center text-rose-400 mb-2">
          <FaExclamationTriangle className="mr-3" size={18} />
          <span className="font-black text-rose-100 tracking-tight">Notifications Blocked</span>
        </div>
        <p className="text-sm text-rose-200/70 font-medium">
          Enable system notifications in browser settings to receive critical system alerts.
        </p>
        <button
          onClick={() => alert('To enable notifications:\n1. Click the lock/info icon in address bar\n2. Find "Notifications"\n3. Change to "Allow"')}
          className="mt-3 text-xs font-bold text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors underline underline-offset-4"
        >
          Configuration Guide
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-4 rounded-2xl mr-4 transition-all duration-500 ${hasSubscription ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-500'}`}>
            <FaBell size={24} className={hasSubscription ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h3 className="font-black text-white tracking-tight">Push Engine</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {hasSubscription
                ? `Synched with ${subscriptionCount} device(s)`
                : 'Background delivery inactive'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative overflow-hidden px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${hasSubscription
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
            : 'bg-emerald-600 text-white border border-emerald-500/50 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="relative z-10 flex items-center">
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" size={12} />
                Processing
              </>
            ) : hasSubscription ? 'Disconnect' : 'Connect'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-3 bg-rose-500/10 rounded-xl text-xs font-medium text-rose-400 border border-rose-500/20 overflow-hidden"
          >
            <strong className="font-black">Alert:</strong> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {hasSubscription && (
        <div className="mt-6 pt-6 border-t border-emerald-500/10 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
            System Connectivity Verified
          </p>
          <div className="flex items-center">
            {showTestSuccess && (
              <motion.span
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mr-4 text-xs font-black text-emerald-400 flex items-center"
              >
                <FaCheck className="mr-1.5" /> EMITTED
              </motion.span>
            )}
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all border border-emerald-500/5 disabled:opacity-50"
            >
              {isLoading ? 'Emitting...' : 'Test Sync'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-emerald-500/5">
        <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
          {hasSubscription ? (
            '✓ Production status: Real-time order synchronization active across all registered service workers.'
          ) : (
            '💡 Integration required: Enable background push to maintain operational awareness even when the dashboard is closed.'
          )}
        </p>
      </div>
    </div>
  );
};

export default PushNotificationToggle;
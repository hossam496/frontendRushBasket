import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-red-600" size={32} />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-4">
          We apologize for the inconvenience. Please try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded text-left">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaRedo className="mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the app state here
        window.location.reload();
      }}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('[ErrorBoundary] Error caught:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default AppErrorBoundary;

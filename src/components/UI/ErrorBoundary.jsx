import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './LoadingStates';

// Higher-order component for error boundaries
export const withErrorBoundary = (Component, fallbackProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary
        FallbackComponent={(props) => (
          <ErrorFallback 
            resetError={props.resetErrorBoundary} 
            error={props.error}
            {...fallbackProps}
          />
        )}
        onError={(error, errorInfo) => {
          console.error('Error caught by boundary:', error, errorInfo);
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, fallbackMessage = 'An error occurred') => {
    console.error('Error handled by hook:', error);
    
    // You can integrate with error reporting services here
    // like Sentry, LogRocket, etc.
    
    // Show user-friendly message
    const message = error?.response?.data?.message || 
                   error?.message || 
                   fallbackMessage;
    
    // You can dispatch to a global error state here
    // or show a toast notification
    
    return { message, error };
  }, []);

  return { handleError };
};

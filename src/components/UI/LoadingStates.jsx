import React, { memo } from 'react';
import { FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

// Loading spinner component
export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <FiLoader className={`animate-spin text-emerald-500 ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-gray-500 text-sm">{text}</p>}
    </div>
  );
};

// Skeleton loader component
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Error boundary fallback component
export const ErrorFallback = ({ error, resetError, message = 'Something went wrong' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{message}</h2>
      <p className="text-gray-500 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Try again
      </button>
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  icon = FiAlertCircle, 
  title = 'No data found', 
  description = 'There are no items to display',
  action 
}) => {
  const Icon = icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && action}
    </div>
  );
};

// Page loading component
export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 to-green-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mx-auto mb-4"></div>
      <div className="text-emerald-600 font-medium animate-pulse">Loading...</div>
    </div>
  </div>
);

// Product card skeleton — mirrors the exact layout of ProductCard in ItemsHome
// Showing this during API load prevents CLS (grid doesn't shift when real cards appear)
export const ProductCardSkeleton = memo(() => (
  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-emerald-500/10 p-2 overflow-hidden animate-pulse">
    {/* Image placeholder */}
    <div className="w-full aspect-square bg-slate-800/50 rounded-[28px]" />
    <div className="p-5 space-y-4">
      {/* Title */}
      <div className="h-5 bg-slate-800 rounded-full w-3/4" />
      <div className="h-2 bg-slate-700 rounded-full w-1/4 mt-2" />
      {/* Price row */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-8 bg-slate-800 rounded-xl w-1/3" />
        <div className="h-8 bg-slate-800 rounded-xl w-1/4" />
      </div>
    </div>
  </div>
));

export const OrderRowSkeleton = memo(() => (
  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[24px] border border-white/5 p-4 mb-4 overflow-hidden animate-pulse">
    <div className="grid grid-cols-12 items-center gap-4">
      <div className="col-span-2 space-y-2">
        <div className="h-2 bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-emerald-500/20 rounded w-3/4" />
      </div>
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-800 rounded w-3/4" />
          <div className="h-2 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="col-span-2 space-y-2">
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="h-2 bg-slate-800 rounded w-1/4" />
      </div>
      <div className="col-span-2">
        <div className="h-6 bg-emerald-500/10 rounded-xl w-1/2" />
      </div>
      <div className="col-span-2 flex justify-center">
        <div className="h-8 bg-slate-800 rounded-full w-24" />
      </div>
      <div className="col-span-1 flex justify-end gap-2">
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
      </div>
    </div>
  </div>
));

export const UserCardSkeleton = memo(() => (
  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 animate-pulse">
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-[28px] bg-slate-800" />
      <div className="h-5 bg-slate-800 rounded-full w-24 mt-4" />
      <div className="h-3 bg-slate-800 rounded-full w-32 mt-2 mb-6" />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-8">
      <div className="h-12 bg-slate-800 rounded-2xl" />
      <div className="h-12 bg-slate-800 rounded-2xl" />
    </div>
    <div className="flex gap-3">
      <div className="h-12 bg-slate-800 rounded-2xl flex-1" />
      <div className="h-12 bg-slate-800 rounded-2xl w-12" />
    </div>
  </div>
));

// Memoized components for better performance
export const MemoizedLoadingSpinner = memo(LoadingSpinner);
export const MemoizedSkeletonLoader = memo(SkeletonLoader);
export const MemoizedErrorFallback = memo(ErrorFallback);
export const MemoizedEmptyState = memo(EmptyState);
export const MemoizedPageLoading = memo(PageLoading);
export const MemoizedProductCardSkeleton = memo(ProductCardSkeleton);
export const MemoizedOrderRowSkeleton = memo(OrderRowSkeleton);
export const MemoizedUserCardSkeleton = memo(UserCardSkeleton);

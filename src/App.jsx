import React, { Suspense, useMemo, useEffect, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback, PageLoading } from './components/UI/LoadingStates'

// Lazy loaded components for better code splitting
const Navbar = lazy(() => import('./components/Navbar'))
const Footer = lazy(() => import('./components/Footer'))
const Home = lazy(() => import('./pages/Home'))
const Contact = lazy(() => import('./pages/Contact'))
const Item = lazy(() => import('./pages/Item'))
const Cart = lazy(() => import('./pages/Cart'))
const MyOrders = lazy(() => import('./components/MyOrders'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const Checkout = lazy(() => import('./components/Checkout'))
const Login = lazy(() => import('./components/Login'))
const Signup = lazy(() => import('./components/Signup'))
const Logout = lazy(() => import('./components/Logout'))
const NotificationsPage = lazy(() => import('./components/NotificationsPage'))
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'))

// Admin components - already lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminOrderList = lazy(() => import('./pages/admin/AdminOrderList'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUserList = lazy(() => import('./pages/admin/AdminUserList'))

// Skeleton loader component
const SkeletonLoader = () => <PageLoading />;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]);
  return null
}

import { useFcm } from './hooks/useFcm'

// App content component with auth logic
const AppContent = () => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const { requestPermission, setupOnMessage } = useFcm();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      requestPermission();
      setupOnMessage();
    }
  }, [isAuthenticated, requestPermission, setupOnMessage]);

  // Memoized computed values
  const isAdminPath = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <CartProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <ScrollToTop />
        {!isAdminPath && (
          <Suspense fallback={<SkeletonLoader />}>
            <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          </Suspense>
        )}
        <Suspense fallback={<SkeletonLoader />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/items' element={<Item />} />

            <Route path='/cart' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated ? <Cart /> : <Navigate replace to='/login' />)
            } />

            <Route path='/myorders' element={<MyOrders />} />
            <Route path='/payment-success' element={<PaymentSuccessPage />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/notifications' element={
              isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />
            } />

            {/* Admin Routes - check isAuthenticated AND isAdmin */}
            <Route path='/admin' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />)
            } />
            <Route path='/admin/products' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated && isAdmin ? <AdminProductList /> : <Navigate to="/login" replace />)
            } />
            <Route path='/admin/orders' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated && isAdmin ? <AdminOrderList /> : <Navigate to="/login" replace />)
            } />
            <Route path='/admin/analytics' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated && isAdmin ? <AdminAnalytics /> : <Navigate to="/login" replace />)
            } />
            <Route path='/admin/users' element={
              loading ? <SkeletonLoader /> : 
              (isAuthenticated && isAdmin ? <AdminUserList /> : <Navigate to="/login" replace />)
            } />

            {/* auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/logout' element={<Logout />} />

            {/* fallback to home */}
            <Route path='*' element={<Navigate replace to='/' />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <PWAInstallPrompt />
        </Suspense>
        {!isAdminPath && (
          <Suspense fallback={<SkeletonLoader />}>
            <Footer />
          </Suspense>
        )}
      </CartProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Global error caught:', error, errorInfo);
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App
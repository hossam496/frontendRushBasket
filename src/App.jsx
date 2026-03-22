import React, { Suspense, useMemo, useEffect, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { CartProvider } from './CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

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

// Admin components - already lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminOrderList = lazy(() => import('./pages/admin/AdminOrderList'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUserList = lazy(() => import('./pages/admin/AdminUserList'))

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mx-auto mb-4"></div>
      <div className="text-emerald-600 font-medium animate-pulse">Loading...</div>
    </div>
  </div>
)

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]);
  return null
}

// App content component with auth logic
const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Memoized computed values
  const isAdminPath = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <SocketProvider>
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

            <Route path='/cart' element={isAuthenticated ? <Cart /> : <Navigate replace to='/login' />} />

            <Route path='/myorders' element={<MyOrders />} />
            <Route path='/payment-success' element={<PaymentSuccessPage />} />
            <Route path='/checkout' element={<Checkout />} />

            {/* Admin Routes */}
            <Route path='/admin' element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path='/admin/products' element={isAdmin ? <AdminProductList /> : <Navigate to="/" />} />
            <Route path='/admin/orders' element={isAdmin ? <AdminOrderList /> : <Navigate to="/" />} />
            <Route path='/admin/analytics' element={isAdmin ? <AdminAnalytics /> : <Navigate to="/" />} />
            <Route path='/admin/users' element={isAdmin ? <AdminUserList /> : <Navigate to="/" />} />

            {/* auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/logout' element={<Logout />} />

            {/* fallback to home */}
            <Route path='*' element={<Navigate replace to='/' />} />
          </Routes>
        </Suspense>
        {!isAdminPath && (
          <Suspense fallback={<SkeletonLoader />}>
            <Footer />
          </Suspense>
        )}
      </CartProvider>
    </SocketProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App
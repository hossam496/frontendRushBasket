import React, { Suspense, useEffect, useState, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { CartProvider } from './CartContext'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Item from './pages/Item'
import Cart from './pages/Cart'
import MyOrders from './components/MyOrders'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import Checkout from './components/Checkout'
import Login from './components/Login'
import Signup from './components/Signup'
import Logout from './components/Logout'
import Footer from './components/Footer'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminOrderList = lazy(() => import('./pages/admin/AdminOrderList'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]);
  return null
}

import api, { saveAuthTokens, clearAuthTokens } from './services/api'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('userData'))
  )
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user')
  const location = useLocation()

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('userData')))
      setUserRole(localStorage.getItem('userRole') || 'user')
    }
    const authFailedHandler = () => {
      setIsAuthenticated(false);
      clearAuthTokens();
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      window.dispatchEvent(new Event('authStateChanged'));
    };

    window.addEventListener('authStateChanged', handler)
    window.addEventListener('authFailed', authFailedHandler)
    return () => {
      window.removeEventListener('authStateChanged', handler)
      window.removeEventListener('authFailed', authFailedHandler)
    }
  }, [])

  const isAdmin = isAuthenticated && userRole === 'admin'
  const isAdminPath = location.pathname.startsWith('/admin')

  return (
    <SocketProvider>
      <CartProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <ScrollToTop />
        {!isAdminPath && <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>}>
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

            {/* auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/logout' element={<Logout />} />

            {/* fallback to home */}
            <Route path='*' element={<Navigate replace to='/' />} />
          </Routes>
        </Suspense>
        {!isAdminPath && <Footer />}
      </CartProvider>
    </SocketProvider>
  )
}

export default App
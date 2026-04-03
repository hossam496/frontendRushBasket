import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { CartProvider } from './CartContext'
import { TranslationProvider } from './contexts/TranslationContext'
import Item from './pages/Item'
import Cart from './pages/Cart'
import Checkout from './components/Checkout'
import Login from './components/Login'
import Logout from './components/Logout'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import MyOrders from './components/MyOrders'
import Contact from './pages/Contact'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductList from './pages/admin/AdminProductList'
import AdminUserList from './pages/admin/AdminUserList'
import AdminOrderList from './pages/admin/AdminOrderList'
import { useAuth } from './context/AuthContext'

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]);
  return null
}

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <TranslationProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/items' element={<Item />} />

          <Route path='/cart' element={isAuthenticated ? <Cart /> : <Navigate replace to='/login' />} />
          <Route path='/myorders' element={isAuthenticated ? <MyOrders /> : <Navigate replace to='/login' />} />
          <Route path='/checkout' element={isAuthenticated ? <Checkout /> : <Navigate replace to='/login' />} />

          {/* auth routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/logout' element={<Logout />} />

          {/* Admin Routes - Protected */}
          <Route path='/admin' element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path='/admin/products' element={
            <AdminRoute>
              <AdminProductList />
            </AdminRoute>
          } />
          <Route path='/admin/users' element={
            <AdminRoute>
              <AdminUserList />
            </AdminRoute>
          } />
          <Route path='/admin/orders' element={
            <AdminRoute>
              <AdminOrderList />
            </AdminRoute>
          } />


          {/* fallback to home */}
          <Route path='*' element={<Navigate replace to='/' />} />
        </Routes>
      </CartProvider>
    </TranslationProvider>
  )
}

export default App
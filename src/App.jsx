import React, { Suspense, useEffect, useState, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './CartContext'
import Navbar from './components/Navbar'
import PWAInstallPrompt from './components/PWAInstallPrompt'

const Home = lazy(() => import('./pages/Home'))
const Item = lazy(() => import('./pages/Item'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./components/Login'))
const Logout = lazy(() => import('./components/Logout'))
const Signup = lazy(() => import('./components/Signup'))
const Contact = lazy(() => import('./pages/Contact'))
const MyOrders = lazy(() => import('./components/MyOrders'))
const Checkout = lazy(() => import('./components/Checkout'))
const VerifyPaymentPage = lazy(() => import('./pages/VerifyPaymentPage'))

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0,0)
  }, [pathname]);
  return null
}

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('authToken'))
  )

  useEffect(() =>{
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('authToken')))
    }
    window.addEventListener('authStateChanged', handler)
    return () => window.removeEventListener('authStateChanged', handler)
  }, [])
  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar isAuthenticated = {isAuthenticated} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-500">Loading...</div>}>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/items' element={<Item />} />

          <Route path='/cart' element={isAuthenticated ? <Cart /> : <Navigate replace to='/login' />} />

          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/myorders/verify' element={<VerifyPaymentPage />} />
          <Route path='/checkout' element={<Checkout />} />

          {/* auth routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/logout' element={<Logout />} />

          {/* fallback to home */}
          <Route path='*' element={<Navigate replace to='/' />} />
        </Routes>
      </Suspense>
      <PWAInstallPrompt />
    </CartProvider>
  )
}

export default App
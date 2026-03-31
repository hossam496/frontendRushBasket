import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { CartProvider } from './CartContext'
import { TranslationProvider } from './contexts/TranslationContext'
import Item from './pages/Item'
import Cart from './pages/Cart'
import Login from './components/Login'
import Logout from './components/Logout'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import Contact from './pages/Contact'

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
    <TranslationProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar isAuthenticated = {isAuthenticated} />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/items' element={<Item />} />

        <Route path='/cart' element={isAuthenticated ? <Cart /> : <Navigate replace to='/login' />} />

         {/* auth routs */}
         <Route path='/login' element={<Login />} />
         <Route path='/signup' element={<Signup />} />
         <Route path='/logout' element={<Logout />} />

         {/* fallback to home */}
         < Route path='*' element={<Navigate replace to='/' />} />
      </Routes>
      </CartProvider>
    </TranslationProvider>
  )
}

export default App
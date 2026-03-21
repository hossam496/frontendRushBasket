// CartContext.jsx - نسخة محسنة
import axios from 'axios';
import { API_BASE_URL } from './services/api';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const CartContext = createContext();

const getAuthHeader = () => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : null;
};

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("authToken") || localStorage.getItem("token"));
};

const GUEST_CART_KEY = 'guestCart';

const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const normalizeItems = (rawItems = []) => {
  return rawItems
    .map(item => {
      return {
        ...item,
        id: item._id || item.id,
        productId: item.product?._id || item.product || item.productId,
        name: item.product?.name || item.name || 'Unnamed',
        price: item.product?.price ?? item.price ?? 0,
        imageUrl: item.product?.imageUrl || item.imageUrl || '',
        quantity: item.quantity || 0,
      };
    })
    .filter(item => item.productId != null);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);
  const [authStatus, setAuthStatus] = useState(isAuthenticated());

  // Sync auth status
  useEffect(() => {
    const checkAuth = () => setAuthStatus(isAuthenticated());
    window.addEventListener('authStateChanged', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('authStateChanged', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const fetchCart = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetch < 2000) {
      return;
    }

    // If not authenticated, load from localStorage
    if (!isAuthenticated()) {
      setCart(getGuestCart());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/cart`,
        getAuthHeader()
      );
      
      const items = Array.isArray(res.data) ? res.data : [];
      const normalized = normalizeItems(items);
      setCart(normalized);
      setLastFetch(now);
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        setCart(getGuestCart());
      }
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  // Sync guest cart to backend after login
  const syncGuestCartToBackend = useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    try {
      // Add each guest item to backend
      for (const item of guestItems) {
        await axios.post(
          `${API_BASE_URL}/api/cart`,
          { productId: item.productId, quantity: item.quantity },
          getAuthHeader()
        );
      }
      // Clear guest cart after sync
      localStorage.removeItem(GUEST_CART_KEY);
      // Fetch merged cart from backend
      await fetchCart(true);
    } catch (err) {
      console.error('Error syncing guest cart:', err);
    }
  }, [fetchCart]);

  // Watch for login and sync cart
  useEffect(() => {
    const wasAuth = authStatus;
    const nowAuth = isAuthenticated();
    
    if (!wasAuth && nowAuth) {
      // User just logged in - sync guest cart
      syncGuestCartToBackend();
    }
    setAuthStatus(nowAuth);
  }, [authStatus, syncGuestCartToBackend]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // تحديث محلي بدون جلب من السيرفر
  const updateLocalCart = useCallback((productId, quantity, productData = null) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      let newCart;
      
      if (existingItem) {
        if (quantity <= 0) {
          newCart = prevCart.filter(item => item.productId !== productId);
        } else {
          newCart = prevCart.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          );
        }
      } else if (quantity > 0 && productData) {
        // إضافة عنصر جديد مؤقتاً
        const newItem = {
          id: `temp-${Date.now()}`,
          productId,
          quantity,
          name: productData.name || 'Unnamed',
          price: productData.price || 0,
          imageUrl: productData.imageUrl || '',
        };
        newCart = [...prevCart, newItem];
      } else {
        newCart = prevCart;
      }

      // Save to localStorage if not authenticated
      if (!isAuthenticated()) {
        saveGuestCart(newCart);
      }
      
      return newCart;
    });
  }, []);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    // تحديث محلي فوري
    updateLocalCart(productId, quantity, productData);
    
    if (!isAuthenticated()) {
      return; // Guest cart - no API call needed
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/cart`,
        { productId, quantity },
        getAuthHeader()
      );
      // جلب التحديثات من السيرفر في الخلفية
      fetchCart(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        // Token expired - save to guest cart instead
        saveGuestCart(cart);
      }
    }
  };

  const updateQuantity = async (lineId, quantity) => {
    // تحديث محلي فوري
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === lineId ? { ...item, quantity } : item
      )
    );

    if (!isAuthenticated()) {
      const updatedCart = cart.map(item =>
        item.id === lineId ? { ...item, quantity } : item
      );
      saveGuestCart(updatedCart);
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${lineId}`,
        { quantity },
        getAuthHeader()
      );
    } catch (err) {
      console.error('Error updating the cart:', err);
      fetchCart(true);
    }
  };

  const removeFromCart = async (lineId) => {
    // تحديث محلي فوري
    setCart(prevCart => prevCart.filter(item => item.id !== lineId));

    if (!isAuthenticated()) {
      const updatedCart = cart.filter(item => item.id !== lineId);
      saveGuestCart(updatedCart);
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${lineId}`, getAuthHeader());
    } catch (err) {
      console.error('Error removing from cart:', err);
      fetchCart(true);
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    
    if (!isAuthenticated()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/clear`, {}, getAuthHeader());
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getCartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cart]
  );

  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        cartCount,
        refreshCart: () => fetchCart(true),
        isAuthenticated: () => isAuthenticated(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
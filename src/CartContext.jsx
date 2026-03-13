// CartContext.jsx - نسخة محسنة
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const CartContext = createContext();

const getAuthHeader = () => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

const normalizeItems = (rawItems = []) => {
  return rawItems
    .map(item => {
      return {
        ...item,
        id: item._id,
        productId: item.product?._id || item.product,
        name: item.product?.name || 'Unnamed',
        price: item.product?.price ?? 0,
        imageUrl: item.product?.imageUrl || '',
        quantity: item.quantity || 0,
      };
    })
    .filter(item => item.id != null);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchCart = useCallback(async (force = false) => {
    // منع الجلب المتكرر خلال ثانيتين
    const now = Date.now();
    if (!force && now - lastFetch < 2000) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/cart', getAuthHeader());
      
      const items = Array.isArray(res.data) ? res.data : [];
      setCart(normalizeItems(items));
      setLastFetch(now);
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        // توكن منتهي - تجاهل
        setCart([]);
      }
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // تحديث محلي بدون جلب من السيرفر
  const updateLocalCart = useCallback((productId, quantity, productData = null) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      
      if (existingItem) {
        if (quantity <= 0) {
          return prevCart.filter(item => item.productId !== productId);
        } else {
          return prevCart.map(item =>
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
        return [...prevCart, newItem];
      }
      return prevCart;
    });
  }, []);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    // تحديث محلي فوري
    updateLocalCart(productId, quantity, productData);
    
    try {
      await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity },
        getAuthHeader()
      );
      // جلب التحديثات من السيرفر في الخلفية
      fetchCart(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      // في حالة الخطأ، نرجع للتحديث القديم
      fetchCart(true);
    }
  };

  const updateQuantity = async (lineId, quantity) => {
    // تحديث محلي فوري
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === lineId ? { ...item, quantity } : item
      )
    );

    try {
      await axios.put(
        `http://localhost:5000/api/cart/${lineId}`,
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

    try {
      await axios.delete(`http://localhost:5000/api/cart/${lineId}`, getAuthHeader());
    } catch (err) {
      console.error('Error removing from cart:', err);
      fetchCart(true);
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await axios.post('http://localhost:5000/api/cart/clear', {}, getAuthHeader());
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
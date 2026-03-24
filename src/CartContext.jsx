import api from './services/api';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './context/AuthContext';

const CartContext = createContext();

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
      const quantity = Number(item.quantity || 0);
      return {
        ...item,
        id: item._id || item.id,
        productId: item.product?._id || item.product || item.productId,
        name: item.product?.name || item.name || 'Unnamed',
        price: Number(item.product?.price ?? item.price ?? 0),
        imageUrl: item.product?.imageUrl || item.imageUrl || '',
        quantity: isNaN(quantity) ? 0 : quantity,
      };
    })
    .filter(item => item.productId != null);
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => {
    if (!isAuthenticated) return getGuestCart();
    try {
      const backup = localStorage.getItem('userCartBackup');
      return backup ? JSON.parse(backup) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef(0);

  const fetchCart = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) {
      return;
    }

    // If not authenticated, load from localStorage
    if (!isAuthenticated) {
      setCart(getGuestCart());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/cart');
      
      const items = Array.isArray(res.data) ? res.data : [];
      const normalized = normalizeItems(items);
      setCart(normalized);
      localStorage.setItem('userCartBackup', JSON.stringify(normalized));
      lastFetchRef.current = now;
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        setCart(getGuestCart());
      } else {
        try {
          const backup = localStorage.getItem('userCartBackup');
          if (backup) setCart(JSON.parse(backup));
        } catch (e) {
          // ignore parsing error
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync guest cart to backend after login
  const syncGuestCartToBackend = useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    try {
      // Add each guest item to backend
      for (const item of guestItems) {
        await api.post(
          '/api/cart',
          { productId: item.productId, quantity: item.quantity }
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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // تحديث محلي بدون جلب من السيرفر
  const updateLocalCart = useCallback((productId, quantity, productData = null) => {
    const qtyToAdd = Number(quantity);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      let newCart;
      
      if (existingItem) {
        if (existingItem.quantity + qtyToAdd <= 0) {
          newCart = prevCart.filter(item => item.productId !== productId);
        } else {
          newCart = prevCart.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + qtyToAdd }
              : item
          );
        }
      } else if (qtyToAdd > 0 && productData) {
        // إضافة عنصر جديد مؤقتاً
        const newItem = {
          id: `temp-${Date.now()}`,
          productId,
          quantity: qtyToAdd,
          name: productData.name || 'Unnamed',
          price: Number(productData.price || 0),
          imageUrl: productData.imageUrl || '',
        };
        newCart = [...prevCart, newItem];
      } else {
        newCart = prevCart;
      }

      // Save to localStorage
      if (!isAuthenticated) {
        saveGuestCart(newCart);
      } else {
        localStorage.setItem('userCartBackup', JSON.stringify(newCart));
      }
      
      return newCart;
    });
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    // تحديث محلي فوري
    updateLocalCart(productId, quantity, productData);
    
    if (!isAuthenticated) {
      return; // Guest cart - no API call needed
    }
    
    try {
      await api.post(
        '/api/cart',
        { productId, quantity }
      );
      // جلب التحديثات من السيرفر في الخلفية
      fetchCart(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateQuantity = async (lineId, quantity) => {
    const newQty = Number(quantity);
    let updatedCart;
    
    // تحديث محلي فوري
    setCart(prevCart => {
      updatedCart = prevCart.map(item =>
        item.id === lineId ? { ...item, quantity: newQty } : item
      );
      
      if (!isAuthenticated) {
        saveGuestCart(updatedCart);
      } else {
        localStorage.setItem('userCartBackup', JSON.stringify(updatedCart));
      }
      return updatedCart;
    });

    if (!isAuthenticated) return;

    try {
      await api.put(
        `/api/cart/${lineId}`,
        { quantity: newQty }
      );
    } catch (err) {
      console.error('Error updating the cart:', err);
      fetchCart(true);
    }
  };

  const removeFromCart = async (lineId) => {
    // تحديث محلي فوري
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== lineId);
      if (!isAuthenticated) {
        saveGuestCart(newCart);
      } else {
        localStorage.setItem('userCartBackup', JSON.stringify(newCart));
      }
      return newCart;
    });

    if (!isAuthenticated) return;

    try {
      await api.delete(`/api/delete-item/${lineId}`); // Updated to match likely backend path or standard
    } catch (err) {
      // If it fails, maybe the path was different, let's try the original one if delete-item fails
      try {
        await api.delete(`/api/cart/${lineId}`);
      } catch (err2) {
        console.error('Error removing from cart:', err2);
        fetchCart(true);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    
    if (!isAuthenticated) return;

    try {
      await api.post('/api/cart/clear', {});
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getCartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cart]
  );

  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
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
        isAuthenticated: () => isAuthenticated,
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
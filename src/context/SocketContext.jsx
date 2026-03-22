import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['polling'], // Forced polling for Vercel serverless compatibility
      reconnectionAttempts: 2, // Stop trying after 2 failures to prevent console spam and crashing
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to socket server');
    });

    newSocket.on('order_updated', (data) => {
      console.log('Order updated:', data);
      if (data.type === 'delete') {
        toast.error(`Order ${data.orderId.substring(0, 8)}... was deleted`, {
          icon: '🗑️',
          style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
        });
      } else {
        toast.success(`Order ${data.orderId.substring(0, 8)}... status: ${data.status}`, {
            icon: '🔄',
            style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' }
          });
      }
      // Notify components to refresh data
      window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
    });

    newSocket.on('product_updated', (data) => {
        console.log('Product updated:', data);
        toast.success(`Products updated: ${data.type}`, {
          icon: '📦',
          style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' }
        });
        window.dispatchEvent(new CustomEvent('productUpdate', { detail: data }));
    });

    newSocket.on('stats_updated', (data) => {
        console.log('Stats updated:', data);
        if (data.type === 'sale') {
            toast.success(`New Sale! +$${data.amount.toFixed(2)}`, {
                icon: '💰',
                style: { background: '#064e3b', color: '#fff', border: '1px solid #10b981' }
            });
        }
        window.dispatchEvent(new CustomEvent('statsUpdate', { detail: data }));
    });

    // Listen for admin events
    newSocket.on('new_order', (data) => {
      toast.success(`🛍️ New Order: ${data.orderId} - $${data.total.toFixed(2)}`, {
        duration: 5000,
        position: 'top-right',
      });
    });

    newSocket.on('new_user', (data) => {
      toast.info(`👤 New User Joined: ${data.name}`, {
        duration: 4000,
        position: 'top-right',
      });
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join_admin_room');
    }
  };

  const value = {
    socket,
    joinAdminRoom,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

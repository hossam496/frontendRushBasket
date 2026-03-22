import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Mock socket implementation - replace with real socket.io if needed
  const mockSocket = {
    connected: false,
    on: (event, callback) => {
      console.log(`Mock socket: listening for ${event}`);
    },
    off: (event) => {
      console.log(`Mock socket: stopped listening for ${event}`);
    },
    emit: (event, data) => {
      console.log(`Mock socket: emitted ${event}`, data);
    }
  };

  const joinAdminRoom = useCallback(() => {
    console.log('Mock: Joined admin room');
  }, []);

  useEffect(() => {
    // Use mock socket instead of real socket.io to prevent connection issues
    setSocket(mockSocket);
    setConnected(true);

    return () => {
      // Cleanup
      setSocket(null);
      setConnected(false);
    };
  }, []);

  const value = {
    socket,
    connected,
    joinAdminRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const AdminLayout = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { socket, joinAdminRoom } = useSocket();

  useEffect(() => {
    joinAdminRoom();

    if (socket) {
      const handleNewOrder = (order) => {
        toast.success(
          `New Order #${order.orderId} from ${typeof order.customer === 'string' ? order.customer : order.customer?.name || 'Customer'}\nTotal: $${order.total.toFixed(2)}`,
          { duration: 5000, position: 'top-right' }
        );
      };

      socket.on('new_order', handleNewOrder);

      return () => {
        socket.off('new_order', handleNewOrder);
      };
    }
  }, [socket, joinAdminRoom]);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />

      {/* Header */}
      <Header 
        title={title}
        onSidebarToggle={handleSidebarToggle}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

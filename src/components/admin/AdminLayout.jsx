import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30">
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
        pt-20 transition-all duration-500 ease-in-out
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        <div className="p-4 lg:p-8 min-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Background Orbs for Premium Look */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AdminLayout;

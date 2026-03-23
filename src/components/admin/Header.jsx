import React, { useState, useCallback, useMemo } from 'react';
import { FiSearch, FiSettings } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

const getAdminInfo = () => {
  try {
    const raw = localStorage.getItem('userData');
    if (raw) {
      const user = JSON.parse(raw);
      return {
        name: user.name || user.username || 'Admin User',
        email: user.email || 'admin@company.com',
      };
    }
  } catch (_) {}
  return { name: 'Admin User', email: 'admin@company.com' };
};

const Header = React.memo(({ title, onSidebarToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const admin = useMemo(() => getAdminInfo(), []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    onSidebarToggle?.();
  }, [onSidebarToggle]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 transition-all duration-300">
      <div className="h-full px-3 sm:px-4 lg:px-8 flex items-center justify-between">
        
        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center min-w-0 flex-shrink-1">
          <button
            onClick={handleSidebarToggle}
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden mr-2"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="truncate">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{title}</h1>
            <p className="hidden xs:block text-[10px] sm:text-xs text-gray-500 truncate">Dashboard</p>
          </div>
        </div>

        {/* Center Section: Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-1 sm:space-x-3 ml-2 flex-shrink-0">
          
          {/* Mobile Search Icon */}
          <button 
            className="p-2 text-gray-500 md:hidden hover:bg-gray-100 rounded-lg"
            aria-label="Search"
          >
             <FiSearch className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          <button 
            className="hidden sm:block p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-gray-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base shadow-sm" aria-label={`User: ${admin.name}`}>
              {admin.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
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
  } catch (_) { }
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
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 right-0 left-0 z-30 transition-all duration-300">
      <div className="h-full px-3 sm:px-4 lg:px-8 flex items-center justify-between max-w-[1920px] mx-auto">

        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center min-w-0 shrink">
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 lg:hidden mr-2 group shrink"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 truncate tracking-tight">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Live Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center Section: Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search anything..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all duration-300 placeholder:text-gray-300"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4 ml-2 shrink-0">

          {/* Mobile Search Icon */}
          <button
            className="p-2.5 text-gray-400 md:hidden hover:bg-gray-100 rounded-xl transition-all"
            aria-label="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>

          <button
            className="hidden sm:flex p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center pl-3 sm:pl-4 border-l border-gray-100 ml-1">
            <div className="flex items-center gap-3 group cursor-pointer p-1 rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-gray-900 leading-none">{admin.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">Super Admin</span>
              </div>
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 transform group-hover:scale-105" aria-label={`User: ${admin.name}`}>
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
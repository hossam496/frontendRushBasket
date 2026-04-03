import React, { useState, useCallback, useMemo } from 'react';
import { FiSearch, FiSettings } from 'react-icons/fi';

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
    <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-emerald-500/10 fixed top-0 right-0 left-0 z-40 transition-all duration-500">
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
            <h1 className="text-base sm:text-lg lg:text-2xl font-black text-white truncate tracking-tight">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live System Status</p>
            </div>
          </div>
        </div>

        {/* Center Section: Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 ml-12">
          <div className="relative w-full group">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search orders, products..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 hover:bg-slate-800/80 border border-emerald-500/10 rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all duration-500 placeholder:text-slate-500"
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
          </div>

          <button
            className="hidden sm:flex p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center pl-4 border-l border-emerald-500/10 ml-2">
            <div className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-2xl hover:bg-emerald-500/5 transition-all duration-300">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-slate-100 leading-none">{admin.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mt-1">Super Admin</span>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 transform group-hover:scale-110" aria-label={`User: ${admin.name}`}>
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
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
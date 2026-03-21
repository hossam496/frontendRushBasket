import React, { useState } from 'react';
import { FiSearch, FiBell, FiSettings } from 'react-icons/fi';

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

const Header = ({ title, onSidebarToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const admin = getAdminInfo();
  const [notifications] = useState([
    { id: 1, text: 'New order received', time: '2 min ago', unread: true },
    { id: 2, text: 'Product stock low', time: '1 hour ago', unread: true },
  ]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 transition-all duration-300">
      <div className="h-full px-3 sm:px-4 lg:px-8 flex items-center justify-between">
        
        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center min-w-0 flex-shrink-1">
          <button
            onClick={onSidebarToggle}
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden mr-2"
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-1 sm:space-x-3 ml-2 flex-shrink-0">
          
          {/* Mobile Search Icon (Optional for small screens) */}
          <button className="p-2 text-gray-500 md:hidden hover:bg-gray-100 rounded-lg">
             <FiSearch className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative group">
            <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <FiBell className="w-5 h-5" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {/* Dropdown - Hidden on very small screens or adjusted position */}
            <div className="absolute right-[-50px] sm:right-0 mt-2 w-64 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
               {/* ... نفس محتوى الـ notifications dropdown ... */}
            </div>
          </div>

          <button className="hidden sm:block p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <FiSettings className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-gray-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base shadow-sm">
              {admin.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
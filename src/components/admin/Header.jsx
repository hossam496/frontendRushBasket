import React, { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiSettings } from 'react-icons/fi';

// Helper to read admin info from localStorage
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

const Header = ({ title, onSidebarToggle, isSidebarCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const admin = getAdminInfo();
  const [notifications] = useState([
    { id: 1, text: 'New order received', time: '2 min ago', unread: true },
    { id: 2, text: 'Product stock low', time: '1 hour ago', unread: true },
    { id: 3, text: 'Customer message', time: '3 hours ago', unread: false },
  ]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 transition-all duration-300">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative group">
            <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <FiBell className="w-5 h-5" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${notification.unread ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <FiSettings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                {admin.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import api, { clearAuthTokens } from '../../services/api';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiPieChart,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiSearch,
  FiBell,
  FiUser,
  FiUsers,
  FiSettings
} from 'react-icons/fi';
import logo from '../../assets/logo.png';

const Sidebar = ({ isCollapsed, isMobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome /> },
    { name: 'Products', path: '/admin/products', icon: <FiPackage /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FiPieChart /> },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    clearAuthTokens();
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logo} alt="FlashBasket Logo" className="w-10 h-10 object-contain" />
            {!isCollapsed && (
              <span className="ml-3 text-xl font-bold text-gray-900">
                FlashBasket
              </span>
            )}
          </div>
          <button 
            onClick={onMobileClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => isMobileOpen && onMobileClose()}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="transition-all duration-200 text-indigo-600 group-hover:text-indigo-700">
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">{link.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            to="/"
            className={`
              flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-2
              text-gray-600 hover:bg-gray-50 hover:text-gray-900
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiArrowLeft className="text-gray-500 group-hover:text-gray-700" />
            {!isCollapsed && <span className="ml-3 font-medium">Back to Shop</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
              text-red-600 hover:bg-red-50 hover:text-red-700
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiLogOut className="text-red-500 group-hover:text-red-600" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

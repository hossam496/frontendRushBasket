import React, { useState } from 'react';
import api, { clearAuthTokens } from '../../services/api';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiUsers,
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            {!isCollapsed && (
              <span className="ml-3 text-lg font-bold text-white">
                RushBasket
              </span>
            )}
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 mt-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => isMobileOpen && onMobileClose()}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-xl">
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">{link.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
          <Link
            to="/"
            className={`
              flex items-center px-4 py-3 rounded-lg transition-colors mb-2
              text-slate-400 hover:text-white hover:bg-slate-800
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiArrowLeft />
            {!isCollapsed && <span className="ml-3 font-medium">Back to Shop</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-3 rounded-lg transition-colors
              text-slate-400 hover:text-rose-400 hover:bg-rose-500/10
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiLogOut />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
        fixed top-0 left-0 h-full bg-slate-900/80 backdrop-blur-xl border-r border-emerald-500/10 z-50 transition-all duration-500 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-emerald-500/10">
          <Link to="/admin" className="flex items-center group">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                RushBasket
              </span>
            )}
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
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
                flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative
                ${isActive
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-500/5'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl z-0"
                    />
                  )}
                  <span className={`relative z-10 text-xl ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400/80'}`}>
                    {link.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="relative z-10 ml-3 font-medium tracking-wide">{link.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-500/10 bg-slate-900/40">
          <Link
            to="/"
            className={`
              flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group mb-2
              text-slate-400 hover:text-slate-200 hover:bg-slate-800
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="ml-3 font-medium">Back to Shop</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group
              text-slate-400 hover:text-rose-400 hover:bg-rose-500/10
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FiLogOut className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

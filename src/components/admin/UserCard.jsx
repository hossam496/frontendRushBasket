import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCalendar, FiShield, FiTrash2, FiUser, FiZap, FiMoreVertical } from 'react-icons/fi';

const UserCard = ({ user, onToggleRole, onDelete }) => {
  const { name, email, role, createdAt, _id } = user;
  const isAdmin = role === 'admin';
  const joinedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300"
    >
      {/* Role Badge Overlay */}
      <div className="absolute top-6 right-6">
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          isAdmin 
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {isAdmin ? 'System Admin' : 'Standard User'}
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className={`relative w-20 h-20 rounded-[28px] flex items-center justify-center text-2xl font-black mb-4 border-2 ${
          isAdmin ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
        }`}>
          {name?.charAt(0).toUpperCase()}
          {/* Active Status Pulse */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </div>

        <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1 group-hover:text-emerald-400 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 justify-center mb-6">
          <FiMail size={12} className="opacity-50" /> {email}
        </p>
      </div>

      {/* Meta Data Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Access Level</span>
          <div className="flex items-center gap-2 text-white">
            {isAdmin ? <FiShield size={14} className="text-purple-400" /> : <FiUser size={14} className="text-blue-400" />}
            <span className="text-xs font-bold capitalize">{role}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Joined Core</span>
          <div className="flex items-center gap-2 text-white">
            <FiCalendar size={14} className="text-emerald-400" />
            <span className="text-xs font-bold">{joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleRole(_id, role)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isAdmin 
              ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white' 
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
          }`}
        >
          <FiZap size={14} /> {isAdmin ? 'Revoke Shield' : 'Elevate Access'}
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="p-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
          title="Archive Identity"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* Decorative ID */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <span className="text-[9px] font-mono text-slate-700">HID: {_id?.slice(-8).toUpperCase()}</span>
      </div>
    </motion.div>
  );
};

export default UserCard;

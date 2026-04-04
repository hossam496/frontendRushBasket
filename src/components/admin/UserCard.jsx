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
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
          isAdmin 
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {isAdmin ? 'System Admin' : 'Standard User'}
        </div>
      </div>

      {/* Profile Core - Gemstone Theme */}
      <div className="flex flex-col items-center text-center mt-6">
        {/* Crystal Avatar Node */}
        <div className={`relative w-24 h-24 rounded-[32px] flex items-center justify-center text-3xl font-bold mb-6 border-2 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:scale-105 ${
          isAdmin 
            ? 'border-purple-500/50 bg-purple-500/10 text-purple-400 shadow-purple-500/10' 
            : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10'
        }`}>
          {name?.charAt(0).toUpperCase()}
          {/* Neural Activity Pulse */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        {/* Identity Crystal Node */}
        <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 mb-3 group-hover:border-emerald-500/20 transition-all">
          <h3 className="text-xl font-bold text-white tracking-tight leading-none capitalize group-hover:text-emerald-400 transition-colors">
            {name}
          </h3>
        </div>
        
        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 justify-center mb-6 uppercase tracking-[0.2em] opacity-60">
          <FiMail size={12} className="text-slate-600" /> {email}
        </p>
      </div>

      {/* Meta Data Cluster - Quartz Nodes */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-all group/node">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 opacity-60">Access Level</span>
          <div className="flex items-center gap-2 text-white">
            <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {isAdmin ? <FiShield size={14} /> : <FiUser size={14} />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">{role}</span>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-all group/node">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 opacity-60">Joined Core</span>
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FiCalendar size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">{joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleRole(_id, role)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold uppercase tracking-wide transition-all ${
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

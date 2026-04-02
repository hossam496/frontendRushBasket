import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection,
  color = 'indigo',
  isLoading = false
}) => {
  const colorClasses = {
    indigo: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
      border: 'border-blue-500/20'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-500/10',
      icon: 'text-rose-400',
      border: 'border-rose-500/20'
    }
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-xl`}></div>
          <div className="w-16 h-6 bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-4 bg-slate-800 rounded w-24 mb-2"></div>
        <div className="h-8 bg-slate-800 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-6 transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`${colors.bg} p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]`}>
          <div className={`${colors.icon}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon, { size: 24 }) : icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`
            flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold
            ${trendDirection === 'up'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-rose-500/10 text-rose-400'
            }
          `}>
            {trendDirection === 'up' ? (
              <FiTrendingUp className="w-3 h-3" />
            ) : (
              <FiTrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>

      {/* Decorative Gradient Line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-emerald-500 to-transparent group-hover:w-full transition-all duration-700 rounded-b-2xl" />
    </div>
  );
};

export default StatCard;

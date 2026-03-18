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
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      border: 'border-indigo-200'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-200'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-200'
    },
    rose: {
      bg: 'bg-rose-50',
      icon: 'text-rose-600',
      border: 'border-rose-200'
    }
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-xl`}></div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`${colors.bg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
          <div className={`${colors.icon}`}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`
            flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium
            ${trendDirection === 'up' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
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
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

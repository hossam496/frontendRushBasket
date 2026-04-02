import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const ChartCard = ({
  title,
  type = 'line',
  data,
  height = 320,
  color = '#10b981',
  gradientColor = '#10b981',
  showFilter = true,
  filterOptions = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months'],
  onFilterChange
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-emerald-500/20">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-6">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ backgroundColor: entry.color || color }}
                ></div>
                <span className="text-sm text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-black text-white">
                {typeof entry.value === 'number' ? `${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              fillOpacity={1}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={color}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-6 transition-all duration-500 hover:border-emerald-500/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Performance Analytics</p>
        </div>
        {showFilter && (
          <select
            className="text-xs font-bold uppercase tracking-widest border border-emerald-500/10 bg-slate-800 text-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all cursor-pointer"
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
          >
            {filterOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;

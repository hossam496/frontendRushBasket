import React from 'react';

const DataTable = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-emerald-500/10">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <div className="h-4 bg-slate-800 rounded w-24 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/5">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {columns.map((_, index) => (
                    <td key={index} className="px-6 py-4">
                      <div className="h-4 bg-slate-800/50 rounded w-32 animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-12 text-center ${className}`}>
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
          <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-white mb-2 tracking-tight">No results found</h3>
        <p className="text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-emerald-500/10">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-500/5">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-emerald-500/5 transition-colors duration-300"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-5 text-sm">
                    {column.cell ? column.cell(row, rowIndex) : <span className="text-slate-300 font-medium">{row[column.accessor]}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

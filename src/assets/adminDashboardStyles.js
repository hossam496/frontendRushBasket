/**
 * Admin Dashboard Modern UI Styles
 * Indigo/Emerald palette with clean, professional aesthetics
 */

export const adminStyles = {
  // Layout & Container
  pageContainer: "space-y-6 animate-fadeIn",
  card: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md",
  cardHeader: "p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50",
  headerTitle: "text-xl font-bold text-slate-900 tracking-tight",
  headerSubtitle: "text-sm text-slate-500 mt-1",
  
  // Actions & Controls
  actionButton: "inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  primaryBtn: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-indigo-300",
  secondaryBtn: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  dangerBtn: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
  successBtn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100",
  
  // Inputs & Filters
  inputGroup: "relative group",
  inputIcon: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors",
  searchField: "pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-64 border border-slate-200",
  selectField: "px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer",
  
  // Table Styling
  tableWrapper: "overflow-x-auto custom-scrollbar",
  table: "w-full text-left border-collapse",
  th: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100",
  td: "px-6 py-4 text-sm text-slate-600 border-b border-slate-50 transition-colors",
  tr: "hover:bg-slate-50/80 transition-colors",
  
  // Badges
  badge: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase",
  badgeIndigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  badgeEmerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  badgeAmber: "bg-amber-50 text-amber-700 border border-amber-100",
  badgeRose: "bg-rose-50 text-rose-700 border border-rose-100",
  badgeSlate: "bg-slate-100 text-slate-600 border border-slate-200",

  // Mobile Cards (Responsive)
  mobileCard: "p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors",
  mobileLabel: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1",
  mobileValue: "text-sm text-slate-900 font-medium",
  
  // Pagination
  paginationContainer: "p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30",
  pageBtn: "p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent",
  pageNumber: "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
  pageActive: "bg-indigo-600 text-white shadow-sm shadow-indigo-200",
  pageInactive: "text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200",

  // Avatars
  avatarMd: "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm",
  avatarLg: "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md",
  
  // Modal
  modalOverlay: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn",
  modalContent: "bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-slideUp",
  modalHeader: "p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10",
  modalBody: "flex-1 overflow-y-auto p-8 custom-scrollbar",
  modalFooter: "p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50"
};

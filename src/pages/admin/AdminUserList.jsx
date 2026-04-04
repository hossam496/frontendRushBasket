import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiUser,
  FiShield,
  FiUsers,
  FiSearch as FiRefresh,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle
} from "react-icons/fi";
import StatCard from "../../components/admin/StatCard";
import UserCard from "../../components/admin/UserCard";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import { UserCardSkeleton } from "../../components/UI/LoadingStates";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(`Neural sync failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = useCallback(async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/api/auth/${userId}/role`, { role: newRole });
      toast.success(`Access level elevated to ${newRole}`);
      // Optimistic update
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol override failed");
    }
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, userId: id });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/auth/${deleteModal.userId}`);
      setUsers(prev => prev.filter(u => u._id !== deleteModal.userId));
      toast.success("Identity purged from core");
      setDeleteModal({ isOpen: false, userId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Decomposition sequence failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const userStats = useMemo(() => ({
    all: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    standard: users.filter(u => u.role === 'user').length,
  }), [users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, roleFilter]);

  return (
    <AdminLayout title="Identity Directory">
      {/* Metrics Cluster */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <StatCard 
          title="Total Identities" 
          value={userStats.all} 
          icon={<FiUsers size={24} />} 
          color="indigo" 
          description="Registered platform users"
        />
        <StatCard 
          title="Shield Bearers" 
          value={userStats.admins} 
          icon={<FiShield size={24} />} 
          color="purple" 
          description="Administrative overrides"
        />
        <StatCard 
          title="Core Users" 
          value={userStats.standard} 
          icon={<FiUser size={24} />} 
          color="blue" 
          description="Standard access nodes"
        />
      </motion.div>

      {/* Operations Station */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
          {/* Identity Search */}
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
              <FiSearch size={18} className="text-slate-500 group-focus-within:text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Locate user by name or email alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white font-medium placeholder:text-slate-600"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'admin', label: 'Shield Bearers' },
              { id: 'user', label: 'Standard' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => setRoleFilter(role.id)}
                className={`px-6 py-4 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                  roleFilter === role.id 
                    ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-y-[-2px]" 
                    : "bg-slate-900/40 backdrop-blur-xl text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={fetchUsers}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/5 text-slate-300 rounded-[24px] font-bold shadow-xl hover:bg-white/10 transition-all text-xs uppercase tracking-wide"
        >
          <FiRefresh size={18} /> Resync Directory
        </button>
      </div>

      {/* Directory Grid */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, i) => <UserCardSkeleton key={i} />)}
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            <motion.div 
               layout
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {paginatedUsers.map(user => (
                  <UserCard 
                    key={user._id} 
                    user={user} 
                    onToggleRole={handleToggleRole} 
                    onDelete={handleDeleteClick} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Active Nodes <span className="text-white">{paginatedUsers.length}</span> of {filteredUsers.length} Detected
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-14 h-14 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/5 transition-all outline-none"
                >
                  <FiChevronLeft size={20} />
                </button>

                <div className="flex gap-2 mx-4">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-14 h-14 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/5 transition-all outline-none"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[48px] border border-dashed border-white/10">
            <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center mb-8 text-slate-700">
              <FiAlertCircle size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Zero Identities Found</h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your search parameters returned no active directory nodes</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Purge Identity Link?"
        message="This operation will permanently de-register this subject from the platform core. This connection cannot be reconstructed."
      />
    </AdminLayout>
  );
};

export default React.memo(AdminUserList);
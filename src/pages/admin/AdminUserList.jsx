import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiShield,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiCalendar,
  FiUser
} from "react-icons/fi";
import { adminStyles } from "../../assets/adminDashboardStyles";

/**
 * AdminUserList - Fully Responsive & Professional Design
 */
const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('[AdminUserList] Fetching users...');
      const res = await api.get('/api/auth');
      console.log('[AdminUserList] Response:', res.data);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error response:", error.response);
      toast.error(`Failed to load users: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = useCallback(async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/api/auth/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      await api.delete(`/api/auth/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  }, []);

  // Filtering & Pagination
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Avatar Component
  const UserAvatar = ({ name, role }) => (
    <div className={`${adminStyles.avatarMd} ${role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
      {name?.charAt(0).toUpperCase() || "U"}
    </div>
  );

  return (
    <AdminLayout title="Users Management">
      <div className={adminStyles.pageContainer}>
        <div className={adminStyles.card}>

          {/* Header & Filters */}
          <div className={adminStyles.cardHeader}>
            <div>
              <h1 className={adminStyles.headerTitle}>User Directory</h1>
              <p className={adminStyles.headerSubtitle}>
                Manage platform users and administrative privileges
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className={adminStyles.inputGroup}>
                <FiSearch className={adminStyles.inputIcon} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className={adminStyles.searchField}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className={adminStyles.selectField}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Standard Users</option>
                </select>

                <button
                  onClick={fetchUsers}
                  className={`${adminStyles.actionButton} ${adminStyles.secondaryBtn} px-3`}
                  title="Refresh"
                >
                  <FiSearch />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading users...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <FiUser className="mx-auto w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-1">Try changing your search or filter</p>
            </div>
          ) : (
            <>
              {/* ==================== Desktop & Tablet Table ==================== */}
              <div className={`${adminStyles.tableWrapper} hidden sm:block`}>
                <table className={adminStyles.table}>
                  <thead>
                    <tr>
                      <th className={adminStyles.th}>User Details</th>
                      <th className={adminStyles.th}>Role</th>
                      <th className={adminStyles.th}>Joined Date</th>
                      <th className={`${adminStyles.th} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user._id} className={adminStyles.tr}>
                        <td className={adminStyles.td}>
                          <div className="flex items-center gap-4">
                            <UserAvatar name={user.name} role={user.role} />
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <FiMail className="opacity-70" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={adminStyles.td}>
                          <span className={`${adminStyles.badge} ${user.role === 'admin' ? adminStyles.badgeIndigo : adminStyles.badgeSlate}`}>
                            {user.role === 'admin' && <FiShield className="mr-1 inline" size={14} />}
                            {user.role}
                          </span>
                        </td>
                        <td className={adminStyles.td}>
                          <div className="flex items-center gap-2 text-slate-500">
                            <FiCalendar className="opacity-60" />
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className={`${adminStyles.td} text-right`}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleRole(user._id, user.role)}
                              className={`${adminStyles.actionButton} ${user.role === 'admin' ? adminStyles.dangerBtn : adminStyles.successBtn} px-4 py-2 text-sm`}
                            >
                              {user.role === 'admin' ? (
                                <><FiUserX className="mr-1" /> Revoke Admin</>
                              ) : (
                                <><FiUserCheck className="mr-1" /> Make Admin</>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className={`${adminStyles.actionButton} ${adminStyles.dangerBtn} px-4 py-2 text-sm`}
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ==================== Mobile Cards View ==================== */}
              <div className="sm:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <div key={user._id} className={adminStyles.mobileCard}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} role={user.role} />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                      <span className={`${adminStyles.badge} ${user.role === 'admin' ? adminStyles.badgeIndigo : adminStyles.badgeSlate}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block">Joined</span>
                        <span className="font-medium text-slate-700">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Status</span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleToggleRole(user._id, user.role)}
                        className={`flex-1 ${adminStyles.actionButton} ${user.role === 'admin' ? adminStyles.dangerBtn : adminStyles.successBtn}`}
                      >
                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className={`${adminStyles.actionButton} ${adminStyles.dangerBtn} w-12 flex items-center justify-center`}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ==================== Pagination ==================== */}
              <div className={adminStyles.paginationContainer}>
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="text-slate-900">{paginatedUsers.length}</span> of{" "}
                  <span className="text-slate-900">{filteredUsers.length}</span> users
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={adminStyles.pageBtn}
                  >
                    <FiChevronLeft />
                  </button>

                  <div className="flex gap-1 overflow-x-auto max-w-[180px] sm:max-w-none">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`${adminStyles.pageNumber} ${currentPage === i + 1 ? adminStyles.pageActive : adminStyles.pageInactive
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={adminStyles.pageBtn}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default React.memo(AdminUserList);
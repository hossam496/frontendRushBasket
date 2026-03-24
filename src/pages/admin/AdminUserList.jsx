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
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight,
  FiMoreVertical,
  FiMail,
  FiCalendar,
  FiUser
} from "react-icons/fi";
import { adminStyles } from "../../assets/adminDashboardStyles";

/**
 * AdminUserList Redesign
 * Modern, responsive user management with search, filters, and pagination.
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
      const res = await api.get('/api/auth');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/auth/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  }, []);

  // Filtering & Pagination Logic
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

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter/search change
  }, [searchTerm, roleFilter]);

  // Sub-component for Avatar
  const UserAvatar = ({ name, role, size = "md" }) => (
    <div className={`${size === "md" ? adminStyles.avatarMd : adminStyles.avatarLg} ${role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
      {name?.charAt(0).toUpperCase() || "U"}
    </div>
  );

  return (
    <AdminLayout title="Users Management">
      <div className={adminStyles.pageContainer}>
        {/* Header & Controls Card */}
        <div className={adminStyles.card}>
          <div className={adminStyles.cardHeader}>
            <div>
              <h1 className={adminStyles.headerTitle}>User Directory</h1>
              <p className={adminStyles.headerSubtitle}>Manage platform access and administrative privileges</p>
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
                  <option value="admin">Admins</option>
                  <option value="user">Standard Users</option>
                </select>
                
                <button 
                  onClick={fetchUsers}
                  className={`${adminStyles.actionButton} ${adminStyles.secondaryBtn} px-3`}
                  title="Reload"
                >
                  <FiFilter />
                </button>
              </div>
            </div>
          </div>

          {/* User List Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium anim-pulse">Synchronizing users...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                <FiUser className="text-slate-300 w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No matches found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                We couldn't find any users matching "{searchTerm}" and role "{roleFilter}"
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={`${adminStyles.tableWrapper} hidden lg:block`}>
                <table className={adminStyles.table}>
                  <thead>
                    <tr>
                      <th className={adminStyles.th}>User Details</th>
                      <th className={adminStyles.th}>Administrative Role</th>
                      <th className={adminStyles.th}>Registration Date</th>
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
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <FiMail className="opacity-70" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={adminStyles.td}>
                          <span className={`${adminStyles.badge} ${user.role === 'admin' ? adminStyles.badgeIndigo : adminStyles.badgeSlate}`}>
                            {user.role === 'admin' && <FiShield className="mr-1 inline" />}
                            {user.role}
                          </span>
                        </td>
                        <td className={adminStyles.td}>
                          <div className="flex items-center gap-2 text-slate-500">
                            <FiCalendar className="opacity-60" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className={`${adminStyles.td} text-right`}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleToggleRole(user._id, user.role)}
                              className={`${adminStyles.actionButton} ${user.role === 'admin' ? adminStyles.dangerBtn : adminStyles.successBtn} px-3 py-1.5`}
                              title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                            >
                              {user.role === 'admin' ? <FiUserX /> : <FiUserCheck />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className={`${adminStyles.actionButton} ${adminStyles.dangerBtn} bg-rose-500 text-white hover:bg-rose-600 border-none px-3 py-1.5 shadow-sm shadow-rose-200`}
                              title="Delete Account"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Table on tablet, cards on mobile) */}
              <div className="lg:hidden divide-y divide-slate-100">
                {paginatedUsers.map((user) => (
                  <div key={user._id} className={adminStyles.mobileCard}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} role={user.role} />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</div>
                        </div>
                      </div>
                      <span className={`${adminStyles.badge} ${user.role === 'admin' ? adminStyles.badgeIndigo : adminStyles.badgeSlate}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <div className={adminStyles.mobileLabel}>Joined</div>
                        <div className={adminStyles.mobileValue}>{new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={adminStyles.mobileLabel}>Status</div>
                        <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-bold">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Active
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleRole(user._id, user.role)}
                        className={`flex-1 ${adminStyles.actionButton} ${user.role === 'admin' ? adminStyles.secondaryBtn : adminStyles.primaryBtn} justify-center`}
                      >
                        {user.role === 'admin' ? <><FiUserX className="mr-2"/> Revoke Admin</> : <><FiUserCheck className="mr-2"/> Make Admin</>}
                      </button>
                      <button 
                         onClick={() => handleDeleteUser(user._id)}
                         className={`${adminStyles.actionButton} ${adminStyles.dangerBtn} justify-center w-12`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className={adminStyles.paginationContainer}>
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="text-slate-900">{Math.min(filteredUsers.length, itemsPerPage)}</span> of <span className="text-slate-900">{filteredUsers.length}</span> users
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className={adminStyles.pageBtn}
                  >
                    <FiChevronLeft className="text-slate-400" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`${adminStyles.pageNumber} ${currentPage === i + 1 ? adminStyles.pageActive : adminStyles.pageInactive}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={adminStyles.pageBtn}
                  >
                    <FiChevronRight className="text-slate-400" />
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

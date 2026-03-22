import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FiUserCheck, FiUserX, FiTrash2, FiShield } from "react-icons/fi";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/api/auth/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/auth/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    {
      header: "User",
      accessor: "name",
      cell: (row) => (
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 font-medium text-sm ${row.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
            {row.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max ${
          row.role === 'admin' 
            ? "bg-indigo-50 text-indigo-700 border border-indigo-200" 
            : "bg-gray-100 text-gray-700 border border-gray-200"
        }`}>
          {row.role === 'admin' && <FiShield className="mr-1" />}
          {row.role.toUpperCase()}
        </span>
      )
    },
    {
      header: "Joined",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleToggleRole(row._id, row.role)}
            className={`p-1.5 rounded-md transition-colors ${
              row.role === 'admin' 
                ? 'text-amber-600 hover:bg-amber-50 tooltip-trigger' 
                : 'text-indigo-600 hover:bg-indigo-50 tooltip-trigger'
            }`}
            title={row.role === 'admin' ? "Remove Admin Role" : "Make Admin"}
          >
            {row.role === 'admin' ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
          </button>
          
          <button 
            onClick={() => handleDeleteUser(row._id)}
            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors tooltip-trigger"
            title="Delete User"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Users Management">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">All Registered Users</h3>
            <p className="text-sm text-gray-500 mt-1">Manage user roles and accounts</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            emptyMessage="No users found."
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserList;

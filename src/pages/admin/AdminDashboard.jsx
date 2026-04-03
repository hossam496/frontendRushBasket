import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/DataTable";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiEye,
} from "react-icons/fi";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeNow: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/api/stats');
      const data = res.data;

      setStats({
        totalSales: data.stats.totalSales,
        totalOrders: data.stats.totalOrders,
        totalCustomers: data.stats.totalCustomers,
        activeNow: data.stats.activeSessions,
      });

      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Simple Welcome Section */}
        <div className="bg-slate-800/20 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-2">Welcome Back, Admin</h2>
          <p className="text-sm text-slate-400">Manage your products, orders, and users from this panel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalSales.toLocaleString()}`}
            icon={<FiDollarSign />}
            color="emerald"
            isLoading={isLoading}
          />
          <StatCard
            title="Net Orders"
            value={stats.totalOrders}
            icon={<FiShoppingBag />}
            color="indigo"
            isLoading={isLoading}
          />
          <StatCard
            title="Customer Base"
            value={stats.totalCustomers}
            icon={<FiUsers />}
            color="amber"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeNow}
            icon={<FiActivity />}
            color="rose"
            isLoading={isLoading}
          />
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-emerald-400 text-sm hover:underline flex items-center gap-1"
            >
              <FiEye /> View All
            </button>
          </div>
          <DataTable
            data={recentOrders}
            loading={isLoading}
            columns={[
              {
                header: "ID",
                accessor: "orderId",
                cell: (row) => (
                  <span className="font-mono text-slate-400">#{row.orderId?.slice(-6) || row._id.slice(-6)}</span>
                )
              },
              {
                header: "Customer",
                accessor: "user",
                cell: (row) => (
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{row.shippingAddress?.fullName || 'Guest'}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{row.paymentMethod}</span>
                  </div>
                )
              },
              {
                header: "Revenue",
                accessor: "total",
                cell: (row) => (
                  <span className="font-bold text-white">
                    ${row.total?.toLocaleString()}
                  </span>
                )
              },
              {
                header: "Status",
                accessor: "status",
                cell: (row) => (
                  <span className={`
                    px-2 py-1 rounded text-[10px] font-bold uppercase
                    ${row.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                      row.status === "Processing" || row.status === "Shipped" ? "bg-blue-500/10 text-blue-400" :
                        row.status === "Cancelled" ? "bg-rose-500/10 text-rose-400" :
                          "bg-amber-500/10 text-amber-400"}
                  `}>
                    {row.status}
                  </span>
                )
              }
            ]}
            emptyMessage="No recent transactions recorded."
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

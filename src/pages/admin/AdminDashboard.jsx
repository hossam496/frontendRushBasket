import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import ChartCard from "../../components/admin/ChartCard";
import DataTable from "../../components/admin/DataTable";
import PushNotificationToggle from "../../components/PushNotificationToggle";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { motion } from "framer-motion";
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiBell,
  FiTrendingUp,
} from "react-icons/fi";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeNow: 0,
    revenueTrend: 0,
    ordersTrend: 0,
    customersTrend: 0,
    sessionsTrend: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
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
        revenueTrend: data.stats.revenueTrend,
        ordersTrend: data.stats.ordersTrend,
        customersTrend: data.stats.customersTrend,
        sessionsTrend: data.stats.sessionsTrend,
      });

      setSalesData(data.salesData);
      setOrdersData(data.ordersData);
      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen for real-time updates from Socket.io (via custom events or context)
    const handleNewOrder = () => {
      fetchStats();
    };

    window.addEventListener("newOrder", handleNewOrder);
    return () => window.removeEventListener("newOrder", handleNewOrder);
  }, [fetchStats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <AdminLayout title="System Overview">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Top Section: Push Sync & Status */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PushNotificationToggle />
          </div>
          <div className="bg-emerald-500/5 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Real-time Engine Active</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              System is currently monitoring <span className="text-white font-bold">{stats.activeNow}</span> active sessions and processing global events via Socket.io.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalSales.toLocaleString()}`}
            icon={<FiDollarSign />}
            trend={stats.revenueTrend}
            trendDirection={stats.revenueTrend >= 0 ? "up" : "down"}
            color="emerald"
            isLoading={isLoading}
          />
          <StatCard
            title="Net Orders"
            value={stats.totalOrders}
            icon={<FiShoppingBag />}
            trend={stats.ordersTrend}
            trendDirection={stats.ordersTrend >= 0 ? "up" : "down"}
            color="indigo"
            isLoading={isLoading}
          />
          <StatCard
            title="Customer Base"
            value={stats.totalCustomers}
            icon={<FiUsers />}
            trend={stats.customersTrend}
            trendDirection={stats.customersTrend >= 0 ? "up" : "down"}
            color="amber"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeNow}
            icon={<FiActivity />}
            trend={stats.sessionsTrend}
            trendDirection={stats.sessionsTrend >= 0 ? "up" : "down"}
            color="rose"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Revenue Velocity"
            type="area"
            data={salesData}
            height={350}
            color="#10b981"
            gradientColor="#10b981"
          />
          <ChartCard
            title="Order Volume"
            type="bar"
            data={ordersData}
            height={350}
            color="#3b82f6"
          />
        </motion.div>

        {/* Bottom Section: Orders & Alerts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-white tracking-tight">Recent Transactions</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="group flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-all"
              >
                <FiEye className="group-hover:scale-110 transition-transform" />
                View Ledger
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
                    <span className="font-black text-emerald-500/80 tracking-tighter">#{row.orderId?.slice(-6) || row._id.slice(-6)}</span>
                  )
                },
                {
                  header: "Customer",
                  accessor: "user",
                  cell: (row) => (
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-bold">{row.shippingAddress?.fullName || 'Guest'}</span>
                      <span className="text-[10px] text-slate-500 font-medium tracking-tight uppercase italic">{row.paymentMethod}</span>
                    </div>
                  )
                },
                {
                  header: "Revenue",
                  accessor: "total",
                  cell: (row) => (
                    <span className="font-black text-white">
                      ${row.total?.toLocaleString()}
                    </span>
                  )
                },
                {
                  header: "Status",
                  accessor: "status",
                  cell: (row) => (
                    <span className={`
                      px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                      ${row.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        row.status === "Processing" || row.status === "Shipped" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          row.status === "Cancelled" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"}
                    `}>
                      {row.status}
                    </span>
                  )
                }
              ]}
              emptyMessage="No recent transactions recorded."
            />
          </div>

          {/* System Alerts */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/10 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiBell className="text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Alerts</h3>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif, idx) => (
                  <motion.div
                    key={notif._id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-xl border group cursor-pointer transition-all duration-300 ${notif.isRead ? 'bg-slate-800/20 border-slate-700/30' : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-lg shadow-emerald-500/5 hover:-translate-y-0.5'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${notif.isRead ? 'text-slate-500' : 'text-emerald-400'}`}>
                        {notif.type || 'System'} Alert
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold mb-1 ${notif.isRead ? 'text-slate-400' : 'text-slate-100'}`}>{notif.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center border border-emerald-500/5">
                    <FiBell className="text-slate-600 text-2xl" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No pending alerts</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/notifications')}
              className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-emerald-500/5"
            >
              Monitor Global Stream
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;

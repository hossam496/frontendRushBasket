import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import ChartCard from "../../components/admin/ChartCard";
import DataTable from "../../components/admin/DataTable";
import PushNotificationToggle from "../../components/PushNotificationToggle";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiPackage,
  FiClock,
  FiBell,
} from "react-icons/fi";
import api from "../../services/api";



const AdminDashboard = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);
  const pollingIntervalRef = useRef(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    newCustomers: 0,
    activeNow: 0,
    revenueTrend: 0,
    ordersTrend: 0,
    customersTrend: 0,
    sessionsTrend: 0,
  });
  const [salesData, setSalesData] = useState([
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ]);

  const [ordersData, setOrdersData] = useState([
    { name: "Mon", value: 24 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 12 },
    { name: "Thu", value: 20 },
    { name: "Fri", value: 15 },
    { name: "Sat", value: 22 },
    { name: "Sun", value: 28 },
  ]);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Initial data fetch
    fetchStats();
    fetchRecentOrders();

    // Set up polling for real-time updates (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchStats();
      fetchRecentOrders();
    }, 30000);

    const handleOrderUpdate = () => {
      fetchStats();
      fetchRecentOrders();
    };

    const handleProductUpdate = () => {
      fetchStats();
    };

    const handleStatsUpdate = (e) => {
      if (e.detail.type === "sale") {
        fetchStats();
        fetchRecentOrders();
      }
    };

    window.addEventListener("orderUpdate", handleOrderUpdate);
    window.addEventListener("productUpdate", handleProductUpdate);
    window.addEventListener("statsUpdate", handleStatsUpdate);

    return () => {
      // Clean up polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      window.removeEventListener("orderUpdate", handleOrderUpdate);
      window.removeEventListener("productUpdate", handleProductUpdate);
      window.removeEventListener("statsUpdate", handleStatsUpdate);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/stats');

      const data = res.data;
      
      setStats({
        totalSales: data.stats.totalSales,
        totalOrders: data.stats.totalOrders,
        newCustomers: data.stats.newCustomers,
        activeNow: data.stats.activeSessions,
      });

      // Update chart data with real data
      setSalesData(data.salesData);
      setOrdersData(data.ordersData);
      
      // Update recent orders with real data
      setRecentOrders(data.recentOrders);
      
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Fallback to original method if stats endpoint fails
      const fallbackRes = await api.get('/api/orders');
      const orders = fallbackRes.data.data || fallbackRes.data || [];
      const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalSales: total,
        totalOrders: orders.length,
        newCustomers: 0,
        activeNow: 0,
      });
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      const orders = res.data.data || res.data || [];
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Push Notifications Card - Only for admins */}
      <div className="mb-8">
        <PushNotificationToggle />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon={<FiDollarSign size={20} />}
          trend={12.5}
          trendDirection="up"
          color="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FiShoppingBag size={20} />}
          trend={8.2}
          trendDirection="up"
          color="indigo"
        />
        <StatCard
          title="New Customers"
          value={stats.newCustomers}
          icon={<FiUsers size={20} />}
          trend={-3.1}
          trendDirection="down"
          color="amber"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeNow}
          icon={<FiActivity size={20} />}
          trend={5.4}
          trendDirection="up"
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Sales Analytics"
          type="area"
          data={salesData}
          height={300}
          color="#10b981"
          gradientColor="#10b981"
        />
        <ChartCard
          title="Orders Overview"
          type="bar"
          data={ordersData}
          height={300}
          color="#4f46e5"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
            </div>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
            >
              <FiEye className="mr-2" />
              View All
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <DataTable
              data={recentOrders}
              columns={[
                {
                  header: "Order ID",
                  accessor: "orderId",
                  cell: (row) => (
                    <span className="font-medium text-indigo-600">#{row.orderId}</span>
                  )
                },
                {
                  header: "Amount",
                  accessor: "total",
                  cell: (row) => (
                    <span className="font-medium text-emerald-600">
                      ${row.total?.toFixed(2)}
                    </span>
                  )
                },
                {
                  header: "Status",
                  accessor: "status",
                  cell: (row) => (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${row.status === "Delivered" ? "bg-emerald-50 text-emerald-700" :
                        row.status === "Processing" || row.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                        row.status === "Cancelled" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"}
                    `}>
                      {row.status}
                    </span>
                  )
                }
              ]}
              emptyMessage="No recent orders found"
            />
          </div>
        </div>

        {/* Recent Notifications Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">System alerts</p>
            </div>
            <button 
              onClick={() => navigate('/notifications')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
            >
              <FiBell className="mr-2" />
              View All
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-3 rounded-xl border ${notif.isRead ? 'bg-gray-50 border-gray-100' : 'bg-emerald-50 border-emerald-100'} transition-all`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${notif.isRead ? 'text-gray-600' : 'text-emerald-700'}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiBell className="text-gray-200 text-4xl mb-2" />
                <p className="text-gray-400 text-sm">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

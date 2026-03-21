import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import ChartCard from "../../components/admin/ChartCard";
import DataTable from "../../components/admin/DataTable";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiPackage,
  FiClock,
} from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";

const BACKEND_URL = API_BASE_URL;

const AdminDashboard = () => {
  const { socket, joinAdminRoom } = useSocket();
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
    joinAdminRoom();
    fetchStats();
    fetchRecentOrders();

    if (socket) {
      socket.on("new_order", (order) => {
        setStats((prev) => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          totalSales: prev.totalSales + order.total,
        }));
        setRecentOrders((prev) => [
          {
            orderId: order.orderId,
            customer: order.customer,
            total: order.total,
            status: "Processing",
            date: new Date().toISOString(),
          },
          ...prev.slice(0, 4),
        ]);

        // Update Chart
        const today = new Date().toLocaleDateString("en-US", {
          weekday: "short",
        });
        setSalesData((prev) =>
          prev.map((item) =>
            item.name === today
              ? { ...item, value: item.value + order.total }
              : item,
          ),
        );
      });

      socket.on("new_user", () => {
        setStats((prev) => ({ ...prev, newCustomers: prev.newCustomers + 1 }));
      });

      socket.on("stats_updated", (data) => {
        if (data.type === "sale") {
          // Handled by new_order usually, but good for other types
        }
      });
    }

    const handleOrderUpdate = () => {
      fetchStats();
      fetchRecentOrders();
    };

    const handleProductUpdate = () => {
      // Products don't directly affect dashboard stats usually, but good to refresh if they do
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
      if (socket) {
        socket.off("new_order");
        socket.off("new_user");
        socket.off("stats_updated");
      }
      window.removeEventListener("orderUpdate", handleOrderUpdate);
      window.removeEventListener("productUpdate", handleProductUpdate);
      window.removeEventListener("statsUpdate", handleStatsUpdate);
    };
  }, [socket]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${BACKEND_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const fallbackRes = await axios.get(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orders = res.data.data || res.data || [];
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
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

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Latest customer orders and their status</p>
          </div>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center">
            <FiEye className="mr-2" />
            View All
          </button>
        </div>

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
              header: "Customer",
              accessor: "customer",
              cell: (row) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3 font-medium text-sm">
                    {(typeof row.customer === "string" ? row.customer : row.customer?.name)?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeof row.customer === "string" ? row.customer : row.customer?.name || "Guest"}
                    </p>
                  </div>
                </div>
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
                  px-2.5 py-1 rounded-full text-xs font-medium
                  ${row.status === "Delivered" ? "bg-emerald-50 text-emerald-700" :
                    row.status === "Processing" || row.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                    row.status === "Cancelled" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"}
                `}>
                  {row.status}
                </span>
              )
            },
            {
              header: "Date",
              accessor: "date",
              cell: (row) => (
                <div className="text-sm text-gray-500">
                  <div>{new Date(row.date).toLocaleDateString()}</div>
                  <div className="text-xs">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              )
            }
          ]}
          emptyMessage="No recent orders found"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

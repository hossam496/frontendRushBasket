import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FiTrendingUp, 
  FiShoppingCart, 
  FiUsers, 
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import DataTable from '../../components/admin/DataTable';


const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    stats: {},
    salesData: [],
    ordersData: [],
    topProducts: [],
    customerData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const res = await api.get('/api/stats');

      setAnalyticsData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Date', 'Sales', 'Orders', 'New Customers'],
      ...analyticsData.salesData.map(item => [
        item.name,
        item.value,
        analyticsData.ordersData.find(o => o.name === item.name)?.value || 0,
        analyticsData.stats.newCustomers || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      {/* Time Range Selector */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Analytics Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Track your business performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => navigate('/admin/orders')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Revenue"
            value={`$${(analyticsData.stats.totalSales || 0).toLocaleString()}`}
            icon={<FiDollarSign size={20} />}
            trend={analyticsData.stats.revenueTrend || 0}
            trendDirection={analyticsData.stats.revenueTrend >= 0 ? 'up' : 'down'}
            color="emerald"
          />
        </div>
        <div onClick={() => navigate('/admin/orders')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Orders"
            value={analyticsData.stats.totalOrders || 0}
            icon={<FiShoppingCart size={20} />}
            trend={analyticsData.stats.ordersTrend || 0}
            trendDirection={analyticsData.stats.ordersTrend >= 0 ? 'up' : 'down'}
            color="indigo"
          />
        </div>
        <div onClick={() => navigate('/admin/users')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Users"
            value={analyticsData.stats.totalCustomers || 0}
            icon={<FiUsers size={20} />}
            trend={analyticsData.stats.customersTrend || 0}
            trendDirection={analyticsData.stats.customersTrend >= 0 ? 'up' : 'down'}
            color="amber"
          />
        </div>
        <StatCard
          title="Active Sessions"
          value={analyticsData.stats.activeSessions || 0}
          icon={<FiTrendingUp size={20} />}
          trend={analyticsData.stats.sessionsTrend || 0}
          trendDirection={analyticsData.stats.sessionsTrend >= 0 ? 'up' : 'down'}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Sales Analytics"
          type="area"
          data={analyticsData.salesData || []}
          color="#10b981"
        />
        <ChartCard
          title="Orders Overview"
          type="bar"
          data={analyticsData.ordersData || []}
          color="#6366f1"
        />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
          <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-700">
            <FiFilter className="mr-1" />
            Filter
          </button>
        </div>
        <DataTable
          data={analyticsData.topProducts || []}
          columns={[
            {
              header: "Product",
              accessor: "name",
              cell: (row) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                    <FiShoppingCart className="text-gray-500" size={14} />
                  </div>
                  <span className="font-medium text-gray-900">{row.name}</span>
                </div>
              )
            },
            {
              header: "Sales",
              accessor: "sales",
              cell: (row) => (
                <span className="font-medium text-gray-900">{row.sales}</span>
              )
            },
            {
              header: "Revenue",
              accessor: "revenue",
              cell: (row) => (
                <span className="font-medium text-emerald-600">${row.revenue?.toFixed(2)}</span>
              )
            }
          ]}
          emptyMessage="No product data available"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

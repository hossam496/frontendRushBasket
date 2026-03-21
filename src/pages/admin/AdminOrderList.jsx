import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiEye,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiMail,
  FiPhone,
  FiClock,
  FiX,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { useSocket } from '../../context/SocketContext';
import { API_BASE_URL } from '../../services/api';

const BACKEND_URL = API_BASE_URL;

const AdminOrderList = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdate = (e) => {
      console.log('Real-time order update received:', e.detail);
      fetchOrders();
    };

    window.addEventListener('orderUpdate', handleOrderUpdate);

    if (socket) {
      socket.on('new_order', (data) => {
        fetchOrders();
      });
    }

    return () => {
      if (socket) socket.off('new_order');
      window.removeEventListener('orderUpdate', handleOrderUpdate);
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by date descending
      const sorted = (res.data.data || res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sorted);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${BACKEND_URL}/api/orders/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error('Error updating status:', err);
      Swal.fire('Error', 'Failed to update order status', 'error');
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o =>
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof o.customer === 'string' ? o.customer : o.customer?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderStats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  return (
    <AdminLayout title="Order Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Orders"
          value={orderStats.pending}
          icon={<FiClock size={20} />}
          color="amber"
        />
        <StatCard
          title="Processing"
          value={orderStats.processing}
          icon={<FiPackage size={20} />}
          color="blue"
        />
        <StatCard
          title="Shipped"
          value={orderStats.shipped}
          icon={<FiTruck size={20} />}
          color="indigo"
        />
        <StatCard
          title="Delivered"
          value={orderStats.delivered}
          icon={<FiCheckCircle size={20} />}
          color="emerald"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">All Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiFilter className="mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <FiDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        <DataTable
          data={filteredOrders}
          loading={loading}
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
                    <p className="text-xs text-gray-500">{row.customer?.email || "No email"}</p>
                  </div>
                </div>
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
            },
            {
              header: "Total",
              accessor: "total",
              cell: (row) => (
                <span className="font-medium text-gray-900">
                  ${row.total?.toFixed(2)}
                </span>
              )
            },
            {
              header: "Payment",
              accessor: "paymentStatus",
              cell: (row) => (
                <span className={`
                  px-2.5 py-1 rounded-full text-xs font-medium
                  ${row.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                    row.paymentStatus === 'COD' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'}
                `}>
                  {row.paymentStatus || 'Pending'}
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
                    row.status === "Pending" ? "bg-amber-50 text-amber-700" :
                    row.status === "Cancelled" ? "bg-red-50 text-red-700" :
                    "bg-gray-50 text-gray-700"}
                `}>
                  {row.status}
                </span>
              )
            },
            {
              header: "Actions",
              accessor: "actions",
              cell: (row) => (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openOrderDetails(row)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FiEye size={16} />
                  </button>
                  <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )
            }
          ]}
          emptyMessage="No orders found"
        />
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderId}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <FiCalendar className="mr-1" /> {new Date(selectedOrder.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Customer Information</h3>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <FiUser size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{typeof selectedOrder.customer === 'string' ? selectedOrder.customer : selectedOrder.customer?.name}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <FiMail className="mr-2" /> {selectedOrder.customer?.email || 'No email'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiPhone className="mr-2" /> {selectedOrder.customer?.phone || 'No phone'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-start mt-2">
                          <FiMapPin className="mr-2 mt-1 flex-shrink-0" /> {selectedOrder.customer?.address || 'No address'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Summary</h3>
                  <div className="bg-indigo-600 text-white p-6 rounded-xl">
                    <div className="space-y-2 text-sm border-b border-white/10 pb-4">
                      <div className="flex justify-between opacity-80">
                        <span>Subtotal</span>
                        <span>${selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between opacity-80">
                        <span>Tax</span>
                        <span>${selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between opacity-80">
                        <span>Shipping</span>
                        <span>${selectedOrder.shipping?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-medium uppercase tracking-wider text-xs">Total</span>
                      <span className="text-2xl font-bold">${selectedOrder.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Update Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedOrder._id, status)}
                          className={`
                            flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all
                            ${selectedOrder.status === status
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          {status === 'Processing' && <FiPackage className="mr-2" />}
                          {status === 'Shipped' && <FiTruck className="mr-2" />}
                          {status === 'Delivered' && <FiCheckCircle className="mr-2" />}
                          {status === 'Cancelled' && <FiXCircle className="mr-2" />}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Items</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className={`flex items-center p-4 ${idx !== selectedOrder.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mr-4 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={`${BACKEND_URL}${item.imageUrl}`} className="w-full h-full object-cover" alt={item.name} />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FiPackage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price?.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">${(item.price * item.quantity)?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderList;

import React, { useState, useEffect, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner, EmptyState, ErrorFallback } from './UI/LoadingStates';
import { FiPackage, FiCalendar, FiDollarSign, FiUser } from 'react-icons/fi';

// Order Status Badge Component
const OrderStatusBadge = React.memo(({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'Processing': { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    'Shipped': { color: 'bg-purple-100 text-purple-800', icon: '📦' },
    'Delivered': { color: 'bg-green-100 text-green-800', icon: '✅' },
    'Cancelled': { color: 'bg-red-100 text-red-800', icon: '❌' }
  };

  const config = statusConfig[status] || statusConfig['Pending'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
});

// Order Item Component
const OrderItem = React.memo(({ item }) => {
  return (
    <div className="flex items-center space-x-4 py-3 border-b last:border-b-0">
      <img 
        src={item.product?.imageUrl || '/placeholder-product.jpg'} 
        alt={item.product?.name || 'Product'}
        className="w-16 h-16 object-contain rounded-lg"
        loading="lazy"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h4>
        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
      </div>
    </div>
  );
});

// Single Order Component
const OrderCard = React.memo(({ order, expanded, onToggle }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <FiCalendar className="mr-1" />
              {formatDate(order.date)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center">
              <FiUser className="mr-1" />
              {typeof order.customer === 'string' ? order.customer : order.customer?.name || 'Guest'}
            </p>
            {order.shippingAddress && (
              <p className="text-sm text-gray-500 mt-1">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">${order.total?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-500">
              {order.items?.length || 0} items
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="w-full text-center py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>

        {expanded && order.items && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-0">
              {order.items.map((item, index) => (
                <OrderItem key={index} item={item} />
              ))}
            </div>
            
            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {order.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Main Orders List Component
export const OrdersList = ({ userId = null, status = null }) => {
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filter, setFilter] = useState({ status: '', search: '' });

  // Build query string
  const query = new URLSearchParams();
  if (userId) query.append('userId', userId);
  if (status) query.append('status', status);
  if (filter.status) query.append('status', filter.status);
  if (filter.search) query.append('search', filter.search);
  
  const queryString = query.toString();
  const { data, loading, error, refetch } = useFetch(`/api/orders${queryString ? `?${queryString}` : ''}`);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    const orders = data?.data || data || [];
    
    if (!filter.search) return orders;
    
    const searchLower = filter.search.toLowerCase();
    return orders.filter(order => 
      order.orderId?.toLowerCase().includes(searchLower) ||
      (typeof order.customer === 'string' ? order.customer : order.customer?.name || '').toLowerCase().includes(searchLower)
    );
  }, [data, filter.search]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading orders..." />;
  }

  if (error) {
    return (
      <ErrorFallback 
        error={error}
        resetError={refetch}
        message="Failed to load orders"
      />
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <EmptyState
        icon={FiPackage}
        title="No orders found"
        description="You haven't placed any orders yet"
        action={
          <a
            href="/"
            className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Start Shopping
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Order ID or customer name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map(order => (
          <OrderCard
            key={order._id || order.orderId}
            order={order}
            expanded={expandedOrders.has(order._id || order.orderId)}
            onToggle={() => toggleOrderExpansion(order._id || order.orderId)}
          />
        ))}
      </div>
    </div>
  );
};

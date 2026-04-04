import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiLayout,
  FiShoppingBag,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import ProductCard from '../../components/admin/ProductCard';
import AdminProductModal from '../../components/admin/AdminProductModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { ProductCardSkeleton } from '../../components/UI/LoadingStates';
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AdminProductList = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to sync product inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await productService.deleteProduct(deleteModal.productId);
      setProducts(prev => prev.filter(p => p._id !== deleteModal.productId));
      toast.success('Product removed from orbit');
      setDeleteModal({ isOpen: false, productId: null });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to remove product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Admin clearance required');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct._id, data);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updated : p));
        toast.success('Inventory record updated');
      } else {
        const created = await productService.createProduct(data);
        setProducts(prev => [created, ...prev]);
        toast.success('New product launched successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const productStats = {
    total: products.length,
    newToday: 2, // Mocked
    valuation: products.reduce((acc, curr) => acc + (curr.price || 0), 0).toFixed(2),
  };

  return (
    <AdminLayout title="Inventory Control">
      {/* Stats Board */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        <StatCard 
          title="Global Inventory" 
          value={productStats.total} 
          icon={<FiShoppingBag size={24} />} 
          color="indigo" 
          description="Total active listings"
        />
        <StatCard 
          title="Stock Valuation" 
          value={`$${productStats.valuation}`} 
          icon={<FiTrendingUp size={24} />} 
          color="emerald" 
          description="Combined asset worth"
        />
        <StatCard 
          title="Recently Updated" 
          value={productStats.newToday} 
          icon={<FiClock size={24} />} 
          color="amber" 
          description="Changes in last 24h"
        />
      </motion.div>

      {/* Control Center */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
          {/* Modern Search */}
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-500 transition-colors">
              <FiSearch size={18} className="text-gray-400 group-focus-within:text-indigo-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-[20px] shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full">
            {['All', 'Fruits', 'Vegetables', 'Dairy', 'Snacks'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  categoryFilter === cat 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]" 
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }} 
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[20px] font-black shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest"
        >
          <FiPlus size={20} /> Launch Product
        </motion.button>
      </div>

      {/* Main Grid Section */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onEdit={handleEdit} 
                  onDelete={handleDeleteClick} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/30 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
              <FiLayout size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No matching inventory</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Remove from Galactic Catalog?"
        message="This operation is permanent. The product data will be purged from our planetary data storage."
      />
    </AdminLayout>
  );
};

export default AdminProductList;

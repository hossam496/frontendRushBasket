import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { resolveImageSrc } from '../../services/imageService';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiUploadCloud,
  FiX,
  FiFilter,
  FiPackage,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AdminProductList = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    oldPrice: '',
    category: 'Fruits',
    description: '',
    image: null,
    imageUrl: ''
  });

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
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      } catch (err) {
        console.error('Error deleting product:', err);
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      category: product.category,
      description: product.description || '',
      image: null,
      imageUrl: product.imageUrl || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be an admin to perform this action');
      return;
    }

    if (!newProduct.name || !newProduct.price) {
      toast.error('Product name and price are required');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('oldPrice', newProduct.oldPrice || newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description || '');
    
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    } else if (newProduct.imageUrl) {
      formData.append('imageUrl', newProduct.imageUrl);
    }

    try {
      if (isEditModalOpen && editingProduct) {
        const updated = await productService.updateProduct(editingProduct._id, formData);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updated : p));
        toast.success('Product updated successfully!');
      } else {
        const created = await productService.createProduct(formData);
        setProducts(prev => [...prev, created]);
        toast.success('Product added successfully!');
      }
      closeModals();
    } catch (err) {
      console.error('Error saving product:', err);
      const status = err.response?.status;
      let errorMessage = err.response?.data?.message || err.message || 'Failed to save product';
      if (status === 401) errorMessage = 'Session expired. Please log in again.';
      if (status === 403) errorMessage = 'Access denied. Admin privileges required.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      price: '',
      oldPrice: '',
      category: 'Fruits',
      description: '',
      image: null,
      imageUrl: ''
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productStats = {
    total: products.length,
    fruits: products.filter(p => p.category === 'Fruits').length,
    vegetables: products.filter(p => p.category === 'Vegetables').length,
    dairy: products.filter(p => p.category === 'Dairy').length,
  };

  return (
    <AdminLayout title="Product Management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={productStats.total} icon={<FiPackage size={20} />} color="indigo" />
        <StatCard title="Fruits" value={productStats.fruits} icon={<FiPackage size={20} />} color="emerald" />
        <StatCard title="Vegetables" value={productStats.vegetables} icon={<FiPackage size={20} />} color="amber" />
        <StatCard title="Dairy" value={productStats.dairy} icon={<FiPackage size={20} />} color="blue" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">All Products</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <FiPlus className="mr-2" /> Add Product
            </button>
          </div>
        </div>

        <DataTable
          data={filteredProducts}
          loading={loading}
          columns={[
            {
              header: "Product",
              accessor: "name",
              cell: (row) => (
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden shrink-0">
                    <img 
                      src={resolveImageSrc(row.image || row.imageUrl)} 
                      alt={row.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => { 
                        e.target.src = 'https://placehold.co/100?text=Error'; 
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.category}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Price",
              accessor: "price",
              cell: (row) => (
                <div>
                  <span className="font-medium text-gray-900">${row.price?.toFixed(2)}</span>
                  {row.oldPrice > row.price && (
                    <div className="text-xs text-gray-500 line-through">${row.oldPrice?.toFixed(2)}</div>
                  )}
                </div>
              )
            },
            {
              header: "Actions",
              accessor: "actions",
              cell: (row) => (
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(row)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Modal for Add/Edit */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{isEditModalOpen ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Old Price ($)</label>
                  <input type="number" step="0.01" value={newProduct.oldPrice} onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Beverages</option><option>Snacks</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500" onClick={() => document.getElementById('image-upload').click()}>
                  {newProduct.image ? (
                    <img src={URL.createObjectURL(newProduct.image)} className="h-40 mx-auto object-contain rounded-lg" alt="Preview (new upload)" />
                  ) : newProduct.imageUrl ? (
                    <img src={resolveImageSrc(newProduct.imageUrl)} className="h-40 mx-auto object-contain rounded-lg" alt="Preview (existing)" />
                  ) : (
                    <div className="py-4 text-gray-500">
                      <FiUploadCloud size={40} className="mx-auto mb-2 text-gray-400" /> 
                      <p className="font-medium text-gray-700">Click to upload product image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP up to 5MB</p>
                    </div>
                  )}
                  <input id="image-upload" type="file" accept="image/*" hidden onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewProduct({...newProduct, image: file});
                    }
                  }} />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || !newProduct.name || !newProduct.price}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving Changes...
                  </>
                ) : (
                  isEditModalOpen ? 'Update Product' : 'Add Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductList;

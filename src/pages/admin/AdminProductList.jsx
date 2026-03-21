import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiMenu, 
  FiSearch,
  FiUploadCloud,
  FiX,
  FiFilter,
  FiDownload,
  FiEye,
  FiPackage
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { API_BASE_URL } from '../../services/api';

const BACKEND_URL = API_BASE_URL;

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    oldPrice: '',
    category: 'Fruits',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
    
    const handleProductUpdate = (e) => {
      console.log('Real-time product update received:', e.detail);
      fetchProducts();
    };

    window.addEventListener('productUpdate', handleProductUpdate);

    return () => {
      window.removeEventListener('productUpdate', handleProductUpdate);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/items`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
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
        const token = localStorage.getItem('authToken');
        await axios.delete(`${BACKEND_URL}/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('oldPrice', newProduct.oldPrice || newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await axios.put(`${BACKEND_URL}/api/items/${editingProduct._id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      setProducts(products.map(p => p._id === editingProduct._id ? res.data.product : p));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', oldPrice: '', category: 'Fruits', description: '', image: null });
      Swal.fire('Success', 'Product updated successfully', 'success');
    } catch (err) {
      console.error('Error updating product:', err);
      Swal.fire('Error', 'Failed to update product', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('oldPrice', newProduct.oldPrice || newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await axios.post(`${BACKEND_URL}/api/items`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setProducts([...products, res.data]);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', oldPrice: '', category: 'Fruits', description: '', image: null });
      Swal.fire('Success', 'Product added successfully', 'success');
    } catch (err) {
      console.error('Error adding product:', err);
      Swal.fire('Error', 'Failed to add product', 'error');
    }
  };

  const getImageSrc = (product) => {
    const rawImage = product.imageUrl || product.image;
    if (!rawImage) return null;
    if (rawImage.startsWith('http')) return rawImage;
    return `${BACKEND_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={productStats.total}
          icon={<FiPackage size={20} />}
          color="indigo"
        />
        <StatCard
          title="Fruits"
          value={productStats.fruits}
          icon={<FiPackage size={20} />}
          color="emerald"
        />
        <StatCard
          title="Vegetables"
          value={productStats.vegetables}
          icon={<FiPackage size={20} />}
          color="amber"
        />
        <StatCard
          title="Dairy"
          value={productStats.dairy}
          icon={<FiPackage size={20} />}
          color="blue"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">All Products</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiFilter className="mr-2" />
                Filter
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <DataTable
          data={filteredProducts}
          loading={loading}
          columns={[
            {
              header: "Product",
              accessor: "name",
              cell: (row) => {
                const imgSrc = getImageSrc(row);
                return (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden flex-shrink-0">
                      {imgSrc ? (
                        <img src={imgSrc} alt={row.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FiPackage className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.category}</p>
                    </div>
                  </div>
                )
              }
            },
            {
              header: "Price",
              accessor: "price",
              cell: (row) => (
                <div>
                  <span className="font-medium text-gray-900">${row.price?.toFixed(2)}</span>
                  {row.oldPrice && row.oldPrice > row.price && (
                    <div className="text-xs text-gray-500 line-through">${row.oldPrice?.toFixed(2)}</div>
                  )}
                </div>
              )
            },
            {
              header: "Category",
              accessor: "category",
              cell: (row) => (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {row.category}
                </span>
              )
            },
            {
              header: "Actions",
              accessor: "actions",
              cell: (row) => (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(row._id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )
            }
          ]}
          emptyMessage="No products found"
        />
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Old Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct({...newProduct, oldPrice: e.target.value})}
                    placeholder="Optional - for sale display"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Dairy</option>
                    <option>Beverages</option>
                    <option>Snacks</option>
                    <option>Seafood</option>
                    <option>Bakery</option>
                    <option>Meat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  {newProduct.image ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(newProduct.image)} className="h-32 mx-auto rounded-lg object-contain" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, image: null})}}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <FiUploadCloud className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  <input 
                    id="image-upload"
                    type="file" 
                    hidden 
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', price: '', oldPrice: '', category: 'Fruits', description: '', image: null });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Old Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct({...newProduct, oldPrice: e.target.value})}
                    placeholder="Optional - for sale display"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Dairy</option>
                    <option>Beverages</option>
                    <option>Snacks</option>
                    <option>Seafood</option>
                    <option>Bakery</option>
                    <option>Meat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => document.getElementById('edit-image-upload').click()}
                >
                  {newProduct.image ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(newProduct.image)} className="h-32 mx-auto rounded-lg object-contain" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, image: null})}}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : editingProduct?.imageUrl ? (
                    <div className="relative">
                      <img src={`${BACKEND_URL}${editingProduct.imageUrl}`} className="h-32 mx-auto rounded-lg object-contain" />
                      <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <FiUploadCloud className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload new image</p>
                    </div>
                  )}
                  <input 
                    id="edit-image-upload"
                    type="file" 
                    hidden 
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductList;

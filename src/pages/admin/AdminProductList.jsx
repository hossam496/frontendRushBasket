import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { resolveImageSrc } from '../../services/imageService';
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
    image: null,
    imageUrl: ''
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
      const res = await api.get('/api/items');
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
        await api.delete(`/api/items/${id}`);
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
    } else if (newProduct.imageUrl) {
      formData.append('imageUrl', newProduct.imageUrl);
    }

    try {
      const res = await api.put(`/api/items/${editingProduct._id}`, formData);
      
      setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', oldPrice: '', category: 'Fruits', description: '', image: null });
      Swal.fire('Success', 'Product updated successfully', 'success');
    } catch (err) {
      console.error('Error updating product:', err);
      Swal.fire('Error', `Failed to update product: ${err.response?.data?.message || err.message}`, 'error');
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
    } else if (newProduct.imageUrl) {
      formData.append('imageUrl', newProduct.imageUrl);
    }

    try {
      const res = await api.post('/api/items', formData);
      setProducts([...products, res.data]);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', oldPrice: '', category: 'Fruits', description: '', image: null });
      Swal.fire('Success', 'Product added successfully', 'success');
    } catch (err) {
      console.error('Error adding product:', err);
      Swal.fire('Error', `Failed to add product: ${err.response?.data?.message || err.message}`, 'error');
    }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">All Products</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
              <div className="relative flex-1 sm:flex-initial">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <FiFilter className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center px-3 py-2 sm:px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FiPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Product</span>
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
                const imgSrc = resolveImageSrc(row.imageUrl || row.image);
                return (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden shrink-0">
                      {imgSrc ? (
                        <img src={imgSrc} alt={row.name} className="w-full h-full object-contain" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  placeholder="Paste external link or local asset name (e.g. Onion.png)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  {newProduct.image ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(newProduct.image)} alt="Product upload preview" className="h-32 mx-auto rounded-lg object-contain" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, image: null})}}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : newProduct.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={resolveImageSrc(newProduct.imageUrl)} 
                        className="h-32 mx-auto rounded-lg object-contain" 
                        alt="Product preview"
                        onError={(e) => { e.target.src = 'https://placehold.co/128?text=Image+Not+Found'; }}
                      />
                      <p className="text-sm text-gray-500 mt-2">Preview from URL</p>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
            <form onSubmit={handleUpdateProduct} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  placeholder="Paste external link or local asset name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload New Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => document.getElementById('edit-image-upload').click()}
                >
                  {newProduct.image ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(newProduct.image)} alt="Product upload preview" className="h-32 mx-auto rounded-lg object-contain" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, image: null})}}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : newProduct.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={resolveImageSrc(newProduct.imageUrl)} 
                        className="h-32 mx-auto rounded-lg object-contain" 
                        alt="Product preview"
                        onError={(e) => { e.target.src = 'https://placehold.co/128?text=Image+Not+Found'; }}
                      />
                      <p className="text-sm text-gray-500 mt-2">Preview from URL</p>
                    </div>
                  ) : editingProduct?.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={resolveImageSrc(editingProduct.imageUrl)} 
                        className="h-32 mx-auto rounded-lg object-contain" 
                        alt={editingProduct.name}
                      />
                      <p className="text-sm text-gray-500 mt-2">Current image</p>
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

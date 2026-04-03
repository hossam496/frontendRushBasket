import API from './api';

const productService = {
  /**
   * Fetch all products
   */
  getProducts: async () => {
    const response = await API.get('/api/products');
    // Handle both { success: true, data: [...] } and direct array [...] from backend
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  /**
   * Create a new product with image file upload
   */
  createProduct: async (formData) => {
    const response = await API.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product || response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id, formData) => {
    const response = await API.put(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product || response.data;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id) => {
    const response = await API.delete(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Update product order
   */
  updateProductOrder: async (products) => {
    const response = await API.put('/api/products/reorder', { products });
    return response.data;
  },
};

export default productService;

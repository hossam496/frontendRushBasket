import React, { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { LoadingSpinner, EmptyState, ErrorFallback } from '../UI/LoadingStates';
import { FiShoppingBag, FiPackage, FiTrendingUp } from 'react-icons/fi';
import { resolveImageSrc } from '../../services/imageService';

// Optimized Product Card Component
export const ProductCard = React.memo(({ product, onAddToCart, loading }) => {
  const handleAddToCart = () => {
    if (!loading) {
      onAddToCart(product._id, 1, product);
    }
  };

  const rawImage = product.image || product.imageUrl;
  const resolvedImage = resolveImageSrc(rawImage);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={resolvedImage}
          alt={product.name}
          className="w-full h-48 object-contain rounded-t-lg"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/300x200?text=No+Image';
          }}
        />
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-emerald-600">${product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FiShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// Optimized Product List Component
export const ProductList = ({ category, search, onAddToCart }) => {
  const [loadingStates, setLoadingStates] = useState({});
  
  // Build query string
  const query = new URLSearchParams();
  if (category) query.append('category', category);
  if (search) query.append('search', search);
  
  const queryString = query.toString();
  const { data, loading, error, refetch } = useFetch(`/api/products${queryString ? `?${queryString}` : ''}`);

  const handleAddToCart = async (productId, quantity, product) => {
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    try {
      await onAddToCart(productId, quantity, product);
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading products..." />;
  }

  if (error) {
    return (
      <ErrorFallback 
        error={error}
        resetError={refetch}
        message="Failed to load products"
      />
    );
  }

  const products = data?.data || data || [];

  if (products.length === 0) {
    return (
      <EmptyState
        icon={FiPackage}
        title="No products found"
        description="Try adjusting your search or browse our categories"
        action={
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Refresh
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={handleAddToCart}
          loading={loadingStates[product._id] || false}
        />
      ))}
    </div>
  );
};

// Category Filter Component
export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !selectedCategory
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Products
      </button>
      {categories.map(category => (
        <button
          key={category._id}
          onClick={() => onCategoryChange(category._id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category._id
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

// Search Component
export const ProductSearch = ({ value, onChange, placeholder = "Search products..." }) => {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
      <FiTrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    </div>
  );
};

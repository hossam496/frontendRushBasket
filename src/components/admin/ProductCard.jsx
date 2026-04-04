import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { resolveImageSrc } from '../../services/imageService';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const { name, price, oldPrice, category, image, imageUrl } = product;
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-emerald-500/10 p-2 transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
    >
      {/* Decorative Gradient Line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-emerald-500 to-transparent group-hover:w-full transition-all duration-700 rounded-b-[32px]" />

      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-800/50 rounded-[28px]">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          src={resolveImageSrc(image || imageUrl)}
          alt={name}
          className="w-full h-full object-contain p-6"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400?text=Product+Image';
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 shadow-sm border border-emerald-500/10">
            <FiTag className="text-emerald-500" />
            {category}
          </span>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black shadow-lg shadow-rose-500/20">
              -{discount}%
            </span>
          </div>
        )}

        {/* Action Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={() => onEdit(product)}
            className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-xl hover:bg-emerald-400 active:scale-95 transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 ease-out"
            title="Edit Product"
          >
            <FiEdit2 size={20} />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="p-3.5 bg-rose-500 text-white rounded-2xl shadow-xl hover:bg-rose-400 active:scale-95 transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 delay-75 ease-out"
            title="Delete Product"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
            ID: {product._id.slice(-6)}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {discount > 0 && (
              <span className="text-xs text-slate-500 line-through mb-1">
                ${oldPrice.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-black text-white tracking-tight">
              ${price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl">
            <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {product.stock > 0 ? 'Active' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

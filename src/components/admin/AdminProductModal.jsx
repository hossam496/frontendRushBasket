import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUploadCloud, FiTrash2, FiPlus, FiBox, FiCheckCircle } from 'react-icons/fi';
import { resolveImageSrc } from '../../services/imageService';
import toast from 'react-hot-toast';

import { CATEGORIES } from '../../constants/categories';

const AdminProductModal = ({ isOpen, onClose, onSubmit, editingProduct, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    category: CATEGORIES[0].name,
    description: '',
    image: null,
    imageUrl: '',
  });

  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        price: editingProduct.price?.toString() || '',
        oldPrice: editingProduct.oldPrice?.toString() || '',
        category: editingProduct.category || CATEGORIES[0].name,
        description: editingProduct.description || '',
        image: null,
        imageUrl: editingProduct.imageUrl || '',
      });
      setPreview(resolveImageSrc(editingProduct.image || editingProduct.imageUrl));
    } else {
      setFormData({
        name: '',
        price: '',
        oldPrice: '',
        category: CATEGORIES[0].name,
        description: '',
        image: null,
        imageUrl: '',
      });
      setPreview(null);
    }
  }, [editingProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleImageChange(file);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl bg-slate-900/60 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden border border-emerald-500/10 max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <FiBox size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                  {editingProduct ? 'Inventory Update' : 'New Product Launch'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                  {editingProduct ? `Serial: #${editingProduct._id.slice(-6)}` : 'Entry Sequence Initiated'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all group"
            >
              <FiX size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-10">
              {/* Product Info Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Core Parameters</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Designation</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Lunar Fuji Apples"
                      className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-bold placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-3 group text-white">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.name} className="bg-slate-900">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <FiPlus className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Valuation ($)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black">$</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legacy Pricing ($)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                      <input
                        type="number"
                        step="0.01"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-slate-400 font-black opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Intellectual Narrative</label>
                <textarea
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Elaborate on the origin, quality, and technical specs of this asset..."
                  className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-medium resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Media Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Visual Identification</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div 
                  className={`relative group h-64 border-2 border-dashed rounded-[40px] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                    dragActive 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                      : "border-white/5 bg-white/5 hover:border-emerald-500/30"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image-upload-main').click()}
                >
                  {preview ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 group/preview">
                      <img src={preview} className="w-full h-full object-contain p-8" alt="Asset identification frame" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                        <div className="flex gap-4 translate-y-4 group-hover/preview:translate-y-0 transition-transform">
                          <span className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Remap Asset</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreview(null);
                              setFormData(prev => ({ ...prev, image: null, imageUrl: '' }));
                            }}
                            className="p-3 bg-rose-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        <FiUploadCloud size={36} className="text-emerald-500" />
                      </div>
                      <p className="text-xl font-black text-white leading-tight">Transmit Visual Data</p>
                      <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">Supports PNG • JPG • WEBP</p>
                    </div>
                  )}
                  <input id="image-upload-main" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e.target.files[0])} />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-10 border-t border-white/5 bg-white/5 flex items-center justify-end gap-6">
            <button
              onClick={onClose}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Abort
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              form="product-form"
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.price}
              className="px-12 py-5 bg-emerald-500 text-white rounded-3xl font-black shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 min-w-[240px] justify-center uppercase tracking-widest text-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {editingProduct ? <FiCheckCircle size={18}/> : <FiPlus size={18} />}
                  {editingProduct ? 'Commit Changes' : 'Initialize Launch'}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminProductModal;

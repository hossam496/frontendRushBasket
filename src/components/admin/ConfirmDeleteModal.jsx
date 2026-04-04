import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
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
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
              <FiAlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              {title || 'Are you sure?'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {message || "This action cannot be undone. This will permanently delete the selected item from our servers."}
            </p>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiTrash2 size={18} />
                  Delete Item
                </>
              )}
            </motion.button>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;

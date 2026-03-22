import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-icons', 'react-hot-toast'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          payment: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          utils: ['axios', 'socket.io-client']
        },
        // Optimize asset file names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    cssCodeSplit: true
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  preview: {
    host: true,
    port: 5173
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — loaded on every page
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-icons', 'react-hot-toast'],
          // Payment — loaded only on checkout
          payment: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          // Lightweight utilities used app-wide
          utils: ['axios'],
          // Admin-only: chart libs, drag & drop, modals, socket.io
          // These will NOT be downloaded by regular users on the homepage / items page
          admin: [
            'chart.js',
            'react-chartjs-2',
            'recharts',
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
            'sweetalert2',
            'socket.io-client',
          ],
        },
        // Optimize asset file names for long-term caching
        assetFileNames: (assetInfo) => {
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
    terserOptions: {
      compress: {
        // Strip all console.* and debugger in production builds
        drop_console: true,
        drop_debugger: true,
        // Remove dead code from tree-shaking
        passes: 2,
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096, // Inline assets smaller than 4 KB as base64
    cssCodeSplit: true,
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
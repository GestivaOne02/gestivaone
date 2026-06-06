import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // PDF generation — jspdf + autotable
          if (id.includes('jspdf') || id.includes('autotable')) {
            return 'pdf'
          }
          // Canvas / html2canvas
          if (id.includes('html2canvas')) {
            return 'canvas'
          }
          // Charts
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'charts'
          }
          // Excel / xlsx
          if (id.includes('xlsx') || id.includes('exceljs')) {
            return 'excel'
          }
          // DOMPurify
          if (id.includes('dompurify') || id.includes('purify')) {
            return 'sanitize'
          }
          // Core vendor (react ecosystem + motion + icons)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'vendor'
          }
          // Zustand + date-fns + clsx + toast utilities
          if (
            id.includes('node_modules/zustand') ||
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/react-hot-toast') ||
            id.includes('node_modules/immer')
          ) {
            return 'utils'
          }
          // Supabase client
          if (id.includes('@supabase')) {
            return 'supabase'
          }
        },
      },
    },
  },
})

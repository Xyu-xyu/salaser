import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Доступ с любого IP в локальной сети
    port: 5173,      // Порт (можно изменить при необходимости)
    strictPort: true, // Запрещает автоматический выбор другого порта, если 5173 занят
    open: true,      // Автоматически открывать браузер при запуске (опционально)
    cors: true,      // Разрешает CORS для API (опционально)
    // https: false,  // Можно включить HTTPS (нужен сертификат)
    
    // Настройки для Proxy, если API бекенда на другом порту (опционально)
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Адрес бекенд-сервера
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  // Оптимизации для продакшена (опционально)
  build: {
    outDir: 'dist',  // Папка сборки
    emptyOutDir: true, // Очищать папку перед сборкой
    sourcemap: true, // Генерировать sourcemaps (опционально)
  }
})
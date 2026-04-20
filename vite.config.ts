import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: true,
    cors: true,
    // Dev: запросы с http://localhost:5173/... → Flask на 5005 (пути /api, /db, /jdb не меняем)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
      '/db': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
      '/jdb': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: '/home/woodver/vematic_1.0/frontend',
    emptyOutDir: true,
    sourcemap: true,
  },
})


/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // <--- относительные пути
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
        target: 'http://localhost:5005', // Адрес бекенд-сервера
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/db': {
        target: 'http://localhost:5005', // Адрес бекенд-сервера
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/db/, ''),
      }
    } 
  },
  // Оптимизации для продакшена (опционально)
  build: {
    //outDir: '/home/woodver/salaserv/templates/laserMain',  // Папка сборки
    
    outDir: '/home/woodver/vematic_1.0/frontend',
    emptyOutDir: true, // Очищать папку перед сборкой
    sourcemap: true, // Генерировать sourcemaps (опционально)
  }
}) */
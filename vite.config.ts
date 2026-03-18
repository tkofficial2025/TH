import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const supabaseUrl = (env.VITE_SUPABASE_URL ?? '').trim()
  const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY ?? '').trim()

  return {
    root: projectRoot,
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion', 'leaflet', 'react-leaflet', 'sonner'],
      force: true, // 504 Outdated Optimize Dep 対策。解消したら false に戻してよい
    },
    server: supabaseUrl
      ? {
          proxy: {
            '/api/supabase-functions': {
              target: supabaseUrl,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/supabase-functions/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (supabaseAnonKey) {
                    proxyReq.setHeader('Authorization', `Bearer ${supabaseAnonKey}`)
                  }
                })
              },
            },
          },
        }
      : {},
  }
})

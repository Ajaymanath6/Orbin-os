import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For Vercel deployment, the app is served from the root (/),
// so we keep base as '/' in all modes. The previous GitHub Pages
// base of '/shopos/' would cause 404s for assets on Vercel.
export default defineConfig(() => {
  return {
    plugins: [react()],
    base: '/',
    build: { outDir: 'dist', assetsDir: 'assets' },
    assetsInclude: ['**/*.svg', '**/*.woff2', '**/*.woff', '**/*.ttf'],
    server: {
      host: true
    }
  }
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from /brew-guide/; dev stays at the root.
  base: command === 'build' ? '/brew-guide/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // The default glob misses fonts and photos, which would leave an
        // offline brew with fallback type and empty cards. Only the latin
        // font subsets are precached; this app has no other alphabets.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}', 'photos/**/*.jpg', 'assets/*-latin*.woff2'],
      },
      manifest: {
        name: 'Brew Guide',
        short_name: 'Brew Guide',
        description: 'Step-by-step manual coffee brewing recipes with a built-in timer.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
}))

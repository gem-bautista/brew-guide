import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // The default glob misses fonts and photos, which would leave an
        // offline brew with fallback type and empty cards. Only the latin
        // font subsets are precached; this app has no other alphabets.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}', 'photos/*.jpg', 'assets/*-latin*.woff2'],
      },
      manifest: {
        name: 'Brew Guide',
        short_name: 'Brew Guide',
        description: 'Step-by-step manual coffee brewing recipes with a built-in timer.',
        theme_color: '#f7f4ee',
        background_color: '#f7f4ee',
        display: 'standalone',
        icons: [],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})

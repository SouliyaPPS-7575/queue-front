import { defineConfig } from '@tanstack/react-start/config';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import tsConfigPaths from 'vite-tsconfig-paths';
import loadEnv from './loadEnv';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd());

export default defineConfig({
  server: {
    preset: 'netlify',
  },
  tsr: {
    appDirectory: 'src',
  },
  vite: {
    ssr: {
      noExternal: ['@mui/*'],
    },
    plugins: [
      TanStackRouterVite({
        autoCodeSplitting: true,
      }),
      checker({
        typescript: true,
      }),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto', // ✅ Automatically updates PWA
        manifest: {
          name: 'E-Commerce Customer',
          short_name: 'E-Commerce Customer',
          description: 'E-Commerce Customer',
          theme_color: '#F3ECD8',
          background_color: '#F3ECD8',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/images/android-chrome-192x192.png', // ✅ Use PNG instead of JPG
              sizes: '192x192',
              type: 'image/jpg',
            },
            {
              src: '/images/android-chrome-512x512.png', // ✅ Use PNG instead of JPG
              sizes: '512x512',
              type: 'image/jpg',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,ico}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          navigateFallback: '/',
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css|woff2|png|jpg|jpeg|gif|svg|ico|webp)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-assets',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          navigateFallback: 'index.html',
          suppressWarnings: true,
          type: 'module',
        },
      }),
    ],
    define: {
      'process.env.BASE_URL': JSON.stringify(env.BASE_URL),
    },

    build: {
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'MODULE_EXTERNALIZED') return;
          warn(warning);
        },
      },
    },

    logLevel: 'error',
  },
});

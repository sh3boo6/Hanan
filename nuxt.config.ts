// https://nuxt.com/docs/api/configuration/nuxt-config
const app = {
  name: 'دليل حنان',
  description: 'صفحة ويب تساعد المستخدم على الوصول للمواقع التي تهم المعلم او الإداري ويوجد بها خدمات تسهّل على الموظف متابعة المهام والأحداث والفعاليات'
}
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vite-pwa/nuxt', '@nuxt/fonts', '@nuxt/image'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1.0',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/ios/16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/ios/32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/icons/android/launchericon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/ios/180.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      appName: app.name,
      appDescription: app.description
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'server',
    clientBundle: {
      scan: true
    },
    serverBundle: {
      collections: ['lucide', 'simple-icons']
    }
  },

  pwa: {
    manifest: {
      name: app.name,
      short_name: app.name,
      description: app.description,
      theme_color: '#ffffff',
      background_color: '#ffffff',
      icons: [
        { src: '/icons/android/launchericon-72x72.png', sizes: '72x72', type: 'image/png' },
        { src: '/icons/android/launchericon-96x96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icons/android/launchericon-144x144.png', sizes: '144x144', type: 'image/png' },
        { src: '/icons/android/launchericon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/android/launchericon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/ios/180.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: false
    }
  }
})

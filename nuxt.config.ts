// https://nuxt.com/docs/api/configuration/nuxt-config
const app = {
  name: 'دليل حنان',
  description: 'صفحة ويب تساعد المستخدم على الوصول للمواقع التي تهم المعلم او الإداري ويوجد بها خدمات تسهّل على الموظف متابعة المهام والأحداث والفعاليات',
  url: 'https://hanan-azure.vercel.app'
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl'
      },
      title: app.name,
      titleTemplate: `%s - ${app.name}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: app.description },
        { name: 'google-site-verification', content: 'dXG2EaowalmjF3ako0fzYzbkB_xnX8Nej7il2NDwy2M' },
        { name: 'google-site-verification', content: 'rZMiR7hgwLEdwcvGNrTI8UUpbHMxfaJoRvUvRzWNjqk' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: app.name },
        { property: 'og:description', content: app.description },
        { property: 'og:url', content: app.url },
        { property: 'og:site_name', content: app.name },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: app.name },
        { name: 'twitter:description', content: app.description }
      ],
      link: [
        { rel: 'canonical', href: app.url },
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

  site: {
    url: app.url,
    name: app.name,
    description: app.description,
    defaultLocale: 'ar'
  },

  runtimeConfig: {
    public: {
      appName: app.name,
      appDescription: app.description
    }
  },

  routeRules: {
    '/': { swr: 3600 }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    experimental: {
      asyncContext: true
    }
  },

  auth: {
    provider: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
        scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
        authorizationParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    }
  },

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
    registerType: 'prompt',
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^\/api\//,
          handler: 'NetworkOnly'
        }
      ]
    },
    devOptions: {
      enabled: false
    }
  },

  sitemap: {
    autoI18n: false,
    strictNuxtContentPaths: true
  }
})

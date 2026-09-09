<script setup>
import { ar } from '@nuxt/ui/locale'
import { useAuthRestore } from '~/composables/useAuthRestore'

const config = useRuntimeConfig()
const { restore } = useAuthRestore()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ],
  htmlAttrs: {
    lang: ar.code,
    dir: ar.dir
  }
})

const handleGlobalRefresh = async () => {
  await refreshNuxtData()
}

const toaster = { position: 'top-right' }

const title = config.public.appName
const description = config.public.appName

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/img/logo.png',
  twitterCard: 'summary_large_image'
})

onMounted(async () => {
  await restore()
})
</script>

<template>
  <UApp
    :locale="ar"
    :toaster="toaster"
  >
    <PullToRefresh :on-refresh="handleGlobalRefresh">
      <NuxtLoadingIndicator
        color="var(--ui-primary)"
        error-color="var(--ui-error)"
        :height="3"
      />
      <NuxtLayout />
      <AppUpdate />
      <ScrollToTop />
    </PullToRefresh>
  </UApp>
</template>

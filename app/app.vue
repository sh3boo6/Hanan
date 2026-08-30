<script setup>
import { ar } from '@nuxt/ui/locale'

const config = useRuntimeConfig()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ],
  htmlAttrs: {
    lang: ar.code,
    dir: ar.dir
  }
})

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
</script>

<template>
  <UApp
    :locale="ar"
    :toaster="toaster"
  >
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      error-color="var(--ui-error)"
      :height="3"
    />
    <NuxtLayout />
    <ScrollToTop />
  </UApp>
</template>

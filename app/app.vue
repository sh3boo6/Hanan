<script setup>
import { ar } from '@nuxt/ui/locale'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  htmlAttrs: {
    lang: ar.code,
    dir: ar.dir
  }
})

const title = 'دليل حنان'
const description = 'صفحة ويب تساعد المستخدم على الوصول للمواقع التي تهم المعلم او الإداري ويوجد بها خدمات تسهّل على الموظف متابعة المهام والأحداث والفعاليات'

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
  <UApp :locale="ar">
    <NuxtLayout />
  </UApp>
</template>

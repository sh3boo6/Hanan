<script setup lang="ts">
import { useShare } from '@vueuse/core'

const { share, isSupported } = useShare()
const config = useRuntimeConfig()

function startShare() {
  share({
    title: config.public.appName,
    text: config.public.appDescription,
    url: location.href
  })
}
</script>

<template>
  <ClientOnly>
    <UButton
      v-if="isSupported"
      class="md:hidden"
      icon="i-lucide-share"
      variant="ghost"
      color="neutral"
      @click="startShare"
    />
  </ClientOnly>
</template>

<!-- components/ScrollToTop.vue -->
<script setup lang="ts">
interface ScrollContainer {
  scrollTop: number
  scrollTo: (options: ScrollToOptions) => void
  addEventListener: (event: string, handler: EventListener) => void
  removeEventListener: (event: string, handler: EventListener) => void
}

const isVisible = ref<boolean>(false)
let scrollContainer: ScrollContainer | null = null

function onScroll(): void {
  if (scrollContainer) {
    isVisible.value = scrollContainer.scrollTop > 300
  }
}

function scrollToTop(): void {
  scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  // adjust selector to match your actual scrollable element
  scrollContainer = document.querySelector('main') || document.documentElement
  scrollContainer.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  scrollContainer?.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <UButton
      v-if="isVisible"
      icon="i-lucide-arrow-up"
      color="primary"
      variant="solid"
      size="lg"
      class="fixed bottom-10 inset-s-6 z-50 rounded-full shadow-lg"
      square
      @click="scrollToTop"
    />
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  onRefresh: () => Promise<void>
  pullThreshold?: number
  maxPull?: number
}>()

const threshold = props.pullThreshold || 80
const maxPull = props.maxPull || 140
const pullDistance = ref(0)
const isRefreshing = ref(false)
const startY = ref(0)
const isPulling = ref(false)
const canStart = ref(true)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

const canTrigger = () => {
  return canStart.value && !isRefreshing.value && window.scrollY <= 0
}

const triggerHaptic = () => {
  if ('navigator' in window && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

const handleTouchStart = (e: TouchEvent) => {
  if (!canTrigger()) return
  const touch = e.touches[0]
  if (!touch) return
  startY.value = touch.clientY
  isPulling.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isPulling.value || isRefreshing.value) return
  const touch = e.touches[0]
  if (!touch) return

  const deltaY = touch.clientY - startY.value
  if (deltaY <= 0) {
    pullDistance.value = 0
    return
  }

  const resisted = Math.pow(deltaY, 0.78)
  pullDistance.value = clamp(resisted, 0, maxPull)

  if (pullDistance.value >= threshold) {
    if (!navigator.vibrate) {
      triggerHaptic()
    }
  }
}

const handleTouchEnd = async () => {
  if (!isPulling.value) return
  isPulling.value = false

  if (pullDistance.value >= threshold && !isRefreshing.value) {
    isRefreshing.value = true
    pullDistance.value = threshold

    try {
      await props.onRefresh()
    } finally {
      isRefreshing.value = false
      pullDistance.value = 0
      startY.value = 0
    }
  } else {
    pullDistance.value = 0
    startY.value = 0
  }
}

const handleTouchCancel = () => {
  isPulling.value = false
  pullDistance.value = 0
  startY.value = 0
}

const handleWheel = (e: WheelEvent) => {
  if (!isPulling.value && window.scrollY <= 0 && e.deltaY < 0) {
    e.preventDefault()
  }
}

const indicatorOpacity = computed(() => {
  if (isRefreshing.value) return 1
  return clamp(pullDistance.value / threshold, 0, 1)
})

const indicatorTranslate = computed(() => {
  if (isRefreshing.value) return 8
  return pullDistance.value - 40
})

const contentTranslate = computed(() => {
  if (!isRefreshing.value && pullDistance.value < threshold) return 0
  return isRefreshing.value ? threshold : pullDistance.value
})

const showIndicator = computed(() => pullDistance.value > 0 || isRefreshing.value)

const isReached = computed(() => pullDistance.value >= threshold && !isRefreshing.value)
</script>

<template>
  <div
    class="relative"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @wheel="handleWheel"
  >
    <div
      v-if="showIndicator"
      class="fixed left-0 right-0 top-0 flex items-center justify-center z-50 pointer-events-none"
      :style="{
        transform: `translateY(${indicatorTranslate}px)`,
        opacity: indicatorOpacity
      }"
    >
      <div
        class="p-2 rounded-full bg-background/90 backdrop-blur shadow-lg flex items-center justify-center"
      >
        <UIcon
          v-if="isRefreshing"
          name="i-lucide-loader-2"
          class="w-5 h-5 text-primary animate-spin"
        />
        <UIcon
          v-else
          name="i-lucide-arrow-down"
          class="w-5 h-5 transition-all duration-150"
          :class="{ 'rotate-180 text-primary': isReached }"
        />
      </div>
    </div>

    <div
      class="transition-transform duration-200 ease-out will-change-transform"
      :style="{
        transform: `translateY(${contentTranslate}px)`
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>

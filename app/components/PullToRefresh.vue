<script setup lang="ts">
const props = defineProps<{
  onRefresh: () => Promise<void>
  pullThreshold?: number
}>()

const threshold = props.pullThreshold || 70
const pullDistance = ref(0)
const isRefreshing = ref(false)
const isShaking = ref(false)
const startY = ref(0)
const hasVibrated = ref(false)

// تشغيل اهتزاز الجهاز عند تجاوز العتبة
const triggerHaptic = () => {
  if ('navigator' in window && navigator.vibrate) {
    // اهتزاز قصير وخفيف مثل نظام iOS
    navigator.vibrate(15)
  }
}

const handleTouchStart = (e: TouchEvent) => {
  if (window.scrollY === 0) {
    const touch = e.touches[0]
    if (!touch) return

    startY.value = touch.clientY
    hasVibrated.value = false
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (startY.value === 0 || isRefreshing.value) return

  const touch = e.touches[0]
  if (!touch) return

  const currentY = touch.clientY
  const deltaY = currentY - startY.value

  if (deltaY > 0 && window.scrollY === 0) {
    pullDistance.value = Math.pow(deltaY, 0.85)

    // اهتزاز لمسي عند الوصول للحد الأدنى للسحب
    if (pullDistance.value >= threshold && !hasVibrated.value) {
      triggerHaptic()
      hasVibrated.value = true
    } else if (pullDistance.value < threshold) {
      hasVibrated.value = false
    }
  }
}

const handleTouchEnd = async () => {
  if (pullDistance.value >= threshold && !isRefreshing.value) {
    isRefreshing.value = true
    pullDistance.value = threshold

    // تفعيل حركة اهتزاز الشاشة البصرية
    isShaking.value = true
    // ✅ تصحيح: توزيع الأوامر على أسطر منفصلة لتجاوز خطأ ESLint
    setTimeout(() => {
      isShaking.value = false
    }, 300)

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
</script>

<template>
  <div
    class="relative overflow-hidden touch-pan-y"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- مؤشر السحب -->
    <div
      class="absolute left-0 right-0 top-0 flex items-center justify-center transition-transform duration-200 ease-out z-10"
      :style="{
        transform: `translateY(${isRefreshing ? 16 : pullDistance - 40}px)`,
        opacity: Math.min(pullDistance / threshold, 1)
      }"
    >
      <div
        class="p-2 rounded-full bg-background/80 backdrop-blur-md shadow-md flex items-center justify-center"
        :class="{ 'animate-shake': isShaking }"
      >
        <UIcon
          v-if="isRefreshing"
          name="i-heroicons-arrow-path"
          class="w-6 h-6 text-primary animate-spin"
        />
        <UIcon
          v-else
          name="i-heroicons-arrow-down"
          class="w-6 h-6 text-gray-500 transition-transform duration-150"
          :class="{ 'rotate-180 text-primary': pullDistance >= threshold }"
        />
      </div>
    </div>

    <!-- محتوى الصفحة مع حركة الاهتزاز -->
    <div
      class="transition-transform duration-200 ease-out"
      :class="{ 'animate-shake': isShaking }"
      :style="{
        transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* إضافة كلاس اهتزاز CSS */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}

.animate-shake {
  animation: shake 0.25s ease-in-out;
}
</style>

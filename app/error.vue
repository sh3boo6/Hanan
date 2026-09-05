<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- App Brand / Header -->
      <div class="flex items-center justify-center gap-3">
        <img
          src="/logo.png"
          alt="App Logo"
          class="size-10 object-contain"
        >
        <span class="text-2xl font-bold text-default">
          {{ appName }}
        </span>
      </div>

      <!-- Error Card -->
      <UCard class="border border-default rounded-2xl p-6 shadow-sm">
        <div class="space-y-4">
          <!-- Status Code Badge -->
          <UBadge
            color="error"
            variant="subtle"
            size="lg"
            class="font-mono font-bold"
          >
            {{ error.statusCode || 500 }}
          </UBadge>

          <!-- Error Title & Message -->
          <h1 class="text-2xl font-bold text-default">
            {{ is404 ? 'الصفحة غير موجودة' : 'حدث خطأ غير متوقع' }}
          </h1>

          <p class="text-sm text-accented">
            {{ is404 ? 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.' : (error.statusMessage || error.message || 'حدث خطأ أثناء معالجة طلبك.') }}
          </p>

          <!-- Action Buttons -->
          <div class="pt-4 flex items-center justify-center gap-3">
            <UButton
              color="primary"
              icon="i-lucide-home"
              size="md"
              @click="handleError"
            >
              الرئيسية
            </UButton>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-rotate-ccw"
              size="md"
              @click="refreshPage"
            >
              إعادة المحاولة
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Footer Info -->
      <p class="text-xs text-accented">
        إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const config = useRuntimeConfig()
const appName = computed(() => config.public.appName || 'اسم التطبيق')

const is404 = computed(() => props.error.statusCode === 404)

// Clear error state and navigate back to safety
const handleError = () => clearError({ redirect: '/' })

// Refresh current page
const refreshPage = () => window.location.reload()
</script>

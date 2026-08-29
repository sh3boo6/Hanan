<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>([
  {
    label: 'الرئيسية',
    icon: 'i-lucide-home',
    to: '/'
  },
  {
    label: 'المهام',
    icon: 'i-lucide-list-todo',
    to: '/todo'
  }
])

// حالة التحكم بفتح وإغلاق السلايدوفر برمجياً
const isSlideoverOpen = ref(false)
</script>

<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-20 flex items-center px-8 bg-accented/20 border-b border-default shrink-0">
        <div class="flex items-center justify-between w-full">
          <ULink to="/">
            <AppLogo class="h-14" />
          </ULink>
          <UNavigationMenu
            :items="items"
            class="hidden xl:flex"
          />
          <ClientOnly>
            <AppWeather />
          </ClientOnly>
          <div class="flex items-center gap-3">
            <AppSearch class="hidden xl:flex" />
            <UColorModeButton />

            <!-- استخدام v-model:open للتحكم الكامل بالحالة -->
            <USlideover
              v-model:open="isSlideoverOpen"
              title="القائمة الجانبية"
              description="تحتوي على الروابط والتقويم ومنشئ رمز الاستجابة السريعة"
              side="left"
            >
              <UButton
                class="xl:hidden"
                icon="i-lucide-qr-code"
                color="neutral"
                variant="ghost"
              />
              <template #body>
                <AppSearch class="flex mb-1 -top-2 xl:hidden" />
                <div class="flex border-b border-default pb-1">
                  <div class="border-e border-default pe-2 me-3 flex justify-start">
                    <!-- عند الضغط على أي عنصر في القائمة، نقوم بإغلاق السلايدوفر فوراً -->
                    <UNavigationMenu
                      :items="items"
                      popover
                      collapsed
                      orientation="vertical"
                      class="xl:hidden"
                      @click="isSlideoverOpen = false"
                    />
                  </div>
                  <ClientOnly>
                    <AppCalendar />
                  </ClientOnly>
                </div>
                <AppQR class="mt-2" />
              </template>
            </USlideover>
          </div>
        </div>
      </header>

      <!-- Scrollable Page Area -->
      <main class="flex-1 overflow-y-auto p-6 flex flex-col">
        <NuxtPage />
      </main>

      <!-- Footer -->
      <footer
        class="h-14 px-6 xl:px-10 border-t border-default shrink-0 flex flex-row items-center justify-between"
        dir="rtl"
      >
        <div class="text-xs font-medium text-muted">
          الثانوية الثانية بالمخواة
        </div>
        <div class="flex text-xs items-center gap-1.5 text-muted">
          <span>جميع الحقوق محفوظة</span>
          <span>-</span>
          <span class="flex items-center gap-1">
            <AppName class="font-semibold" /> {{ new Date().getFullYear() }} &copy;
          </span>
          <span class="hidden xl:inline text-xs opacity-75">| هذه النسخة تجريبية - الإصدار 1.0.0</span>
          <AppLogo class="h-6 inline ms-0.5 align-middle" />
        </div>
      </footer>
    </div>

    <!-- Desktop Right Sidebar -->
    <aside class="hidden xl:flex w-80 flex-col bg-accented/20 border-s border-default shrink-0">
      <div class="flex-1 p-4 flex flex-col">
        <ClientOnly>
          <AppCalendar />
        </ClientOnly>
      </div>
      <USeparator type="dashed" />
      <div class="flex-1 p-4">
        <!-- Secondary Sidebar Content -->
        <AppQR />
      </div>
    </aside>
  </div>
</template>

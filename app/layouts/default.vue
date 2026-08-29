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
</script>

<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-20 flex items-center px-8 bg-accented/20 border-b border-default shrink-0">
        <div class="flex items-center justify-between w-full">
          <AppLogo class="h-14" />
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
            <USlideover
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
                <div class="flex border-b border-default pb-3">
                  <div class="border-e border-default pe-2 me-3 flex justify-start">
                    <UNavigationMenu
                      :items="items"
                      popover
                      collapsed
                      orientation="vertical"
                      class="xl:hidden"
                    />
                  </div>
                  <ClientOnly>
                    <AppCalendar />
                  </ClientOnly>
                </div>
                <AppSearch class="flex my-3 xl:hidden" />
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
      <footer class="h-14 flex text-sm items-center justify-center xl:justify-end text-muted px-6 xl:px-10 border-t border-default shrink-0">
        جميع الحقوق محفوظة - <AppName class="font-semibold" /> {{ new Date().getFullYear() }} &copy; - هذه النسخه تجريبية | الاصدار 1.0.0
        <AppLogo class="h-8 inline ms-1" />
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

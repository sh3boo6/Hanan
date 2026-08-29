<!-- app.vue -->
<script setup>
const { data: newsData, pending, error } = await useFetch('/api/news/okaz')
</script>

<template>
  <UContainer
    class="py-8"
    dir="rtl"
  >
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl flex items-center gap-3 font-bold text-highlighted">
            <img
              src="https://www.okaz.com.sa/okaz/uploads/global_files/main-logo.png"
              class="h-8 object-contain"
              alt="عكاظ Logo"
            >
            {{ newsData?.title || 'عكاظ' }}
          </h1>
        </div>
      </template>

      <!-- حالة التحميل -->
      <div
        v-if="pending"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="w-8 h-8 animate-spin text-primary"
        />
        <span class="mr-2 text-muted">جاري تحميل الأخبار...</span>
      </div>

      <!-- حالة حدوث خطأ -->
      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        title="تنبيه"
        description="حدث خطأ أثناء جلب الأخبار من عكاظ. يرجى المحاولة لاحقاً."
        icon="i-lucide-alert-circle"
      />

      <!-- عرض قائمة الأخبار عند الجلب بنجاح -->
      <div
        v-else
        class="divide-y divide-default"
      >
        <div
          v-for="item in newsData?.items"
          :key="item.link"
          class="py-4 first:pt-0 last:pb-0"
        >
          <div class="flex flex-col gap-2">
            <ULink
              :href="item.link"
              target="_blank"
              rel="noopener"
              class="font-semibold text-lg text-primary hover:underline"
            >
              {{ item.title }}
            </ULink>

            <UBadge
              variant="subtle"
              size="xs"
              class="w-fit"
            >
              {{ new Date(item.pubDate).toLocaleDateString('ar-SA') }}
            </UBadge>

            <p class="text-muted text-sm leading-relaxed">
              {{ item.contentSnippet }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

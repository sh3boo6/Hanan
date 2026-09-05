<template>
  <div class="h-full flex flex-col items-center justify-center p-6 text-center">
    <UCard class="max-w-md w-full border border-default">
      <div class="py-8 space-y-4">
        <div class="mx-auto w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
          <UIcon
            name="i-lucide-frown"
            class="size-12 text-primary-500"
          />
        </div>

        <h1 class="text-6xl font-black text-default tracking-tight">
          404
        </h1>

        <h2 class="text-xl font-bold text-default">
          الصفحة غير موجودة
        </h2>

        <p class="text-sm text-accented">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون محذوفة أو منقولة أو لم تعد موجودة.
        </p>

        <UButton
          to="/"
          color="primary"
          size="lg"
          block
          icon="i-lucide-home"
        >
          العودة للرئيسية
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'none'
})

useHead({
  title: '404 - الصفحة غير موجودة'
})
</script>

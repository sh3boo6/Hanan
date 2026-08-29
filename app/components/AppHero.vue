<template>
  <div class="min-h-34 rounded-2xl bg-primary/10 border border-dashed border-primary p-3 px-6 text-primary/90 flex items-center">
    <div class="flex items-center justify-between flex-1">
      <ClientOnly>
        <AppDay />
      </ClientOnly>
      <AppPrayer />
      <AppClock
        class="min-w-22 min-h-22 border rounded-full border-primary/50 relative -top-1.5"
      />
    </div>
  </div>
</template>

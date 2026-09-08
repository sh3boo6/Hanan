<script setup lang="ts">
import { computed, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps<{
  open: boolean
  text: string
  title?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const qrDataUrl = computed({
  get: () => props.open ? '' : '',
  set: () => {}
})

watch(
  () => [props.open, props.text] as const,
  async ([open, text], old) => {
    if (open && text && (!old || old[0] !== open || old[1] !== text)) {
      try {
        const url = await QRCode.toDataURL(text, { width: 300, margin: 2 })
        qrDataUrl.value = url
      } catch {
        qrDataUrl.value = ''
      }
    }
  },
  { immediate: true }
)

const save = () => {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = 'qrcode.png'
  a.click()
}
</script>

<template>
  <UModal
    :open="open"
    :title="title || 'رمز الاستجابة السريعة'"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="flex flex-col items-center gap-4 p-4">
        <div class="bg-white border border-default rounded-xl p-3 shadow-sm">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR Code"
            width="240"
            height="240"
            class="h-60 w-60 object-contain"
          >
          <div
            v-else
            class="h-60 w-60 flex items-center justify-center text-muted"
          >
            جاري التوليد...
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            label="حفظ الصورة"
            variant="outline"
            color="primary"
            :disabled="!qrDataUrl"
            @click="save"
          />
          <UButton
            label="إغلاق"
            color="neutral"
            @click="emit('update:open', false)"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

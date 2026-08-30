<script setup lang="ts">
import { ref, reactive } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const toast = useToast()

const qrData = ref<string | null>(null)
const qrDataUrl = ref<string | null>(null)
const generateModal = ref(false)

const schema = z.object({
  text: z.string().min(1, 'يجب إدخال نص أو رابط لإنشاء الرمز')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  text: undefined
})

async function onGenerate(event: FormSubmitEvent<Schema>) {
  try {
    const text = event.data.text
    const url = await QRCode.toDataURL(text, { width: 300, margin: 2 })
    qrData.value = text
    qrDataUrl.value = url
    generateModal.value = false
    state.text = ''
    toast.add({ title: 'نجاح', description: 'تم إنشاء الرمز بنجاح.', color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'خطأ', description: 'فشل في إنشاء رمز الاستجابة السريعة.', color: 'error' })
  }
}

const saveQrImage = () => {
  if (!qrDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = 'qrcode.png'
  link.click()
  toast.add({ title: 'حفظ', description: 'تم تحميل صورة الرمز بنجاح.', color: 'success' })
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        qrData.value = code.data
        QRCode.toDataURL(code.data, { width: 300, margin: 2 }).then((url) => {
          qrDataUrl.value = url
        })
        toast.add({ title: 'قراءة ناجحة', description: 'تم استخراج البيانات من الصورة بنجاح.', color: 'success' })
      } else {
        toast.add({ title: 'تنبيه', description: 'لم يتم العثور على رمز صالح في الصورة.', color: 'warning' })
      }
    }
    img.src = event.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const pasteQrImage = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read()
    for (const item of clipboardItems) {
      const imageType = item.types.find(type => type.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
              qrData.value = code.data
              QRCode.toDataURL(code.data, { width: 300, margin: 2 }).then((url) => {
                qrDataUrl.value = url
              })
              toast.add({ title: 'تم اللصق والقراءة', description: 'تم قراءة الرمز من الحافظة بنجاح.', color: 'success' })
            } else {
              toast.add({ title: 'تنبيه', description: 'الصورة المنسوخة لا تحتوي على رمز استجابة سريعة صالح.', color: 'warning' })
            }
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(blob)
        return
      }
    }
    toast.add({ title: 'تنبيه', description: 'لا توجد صورة في الحافظة.', color: 'warning' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'خطأ', description: 'فشل الوصول إلى الحافظة أو قراءة الصورة.', color: 'error' })
  }
}

const resetQr = () => {
  qrData.value = null
  qrDataUrl.value = null
  toast.add({ title: 'حذف', description: 'تم إزالة الرمز الحالي.', color: 'neutral' })
}

const copyToClipboard = async () => {
  if (!qrData.value) return
  try {
    await navigator.clipboard.writeText(qrData.value)
    toast.add({ title: 'نسخ', description: 'تم نسخ النص إلى الحافظة بنجاح.', color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'خطأ', description: 'فشل نسخ النص.', color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileUpload"
    >
    <div class="border border-dashed text-center text-sm bg-primary/20 border-primary/50 rounded-lg mt-2 font-semibold text-primary p-1.5">
      رمز الاستجابة السريعة QR Code
    </div>
    <div class="flex items-start justify-center gap-6">
      <div class="bg-white border border-default h-44 max-w-44 flex-1 flex">
        <div class="flex-1 flex justify-center items-center overflow-hidden p-2">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR Code"
            width="300"
            height="300"
            class="h-full object-contain"
          >
          <div
            v-else
            class="flex-1 flex justify-center items-center cursor-not-allowed"
          >
            <UIcon
              name="i-lucide-qr-code"
              class="w-26 h-26 text-muted opacity-40"
            />
          </div>
        </div>
      </div>
      <div class="w-24 flex flex-col gap-0.5 h-44 justify-between">
        <UButton
          label="انشاء رمز"
          size="sm"
          variant="outline"
          color="primary"
          class="w-full justify-center"
          @click="generateModal = true"
        />
        <UButton
          label="حفظ الرمز"
          size="sm"
          variant="outline"
          color="neutral"
          class="w-full justify-center"
          :disabled="!qrDataUrl"
          @click="saveQrImage"
        />
        <UButton
          label="قراءة رمز"
          size="sm"
          variant="outline"
          color="secondary"
          class="w-full justify-center"
          @click="triggerFileUpload"
        />
        <UButton
          label="لصق رمز"
          size="sm"
          variant="outline"
          color="warning"
          class="w-full justify-center"
          @click="pasteQrImage"
        />
        <UButton
          label="حذف الرمز"
          size="sm"
          variant="outline"
          color="error"
          class="w-full justify-center"
          :disabled="!qrDataUrl"
          @click="resetQr"
        />
      </div>
    </div>

    <!-- عرض البيانات المستخرجة في الأسفل مع زر النسخ -->
    <div
      v-if="qrData"
      class="border border-dashed text-primary font-semibold border-primary/40 rounded-2xl bg-primary/5 flex items-center justify-between px-4 py-2 text-sm gap-3"
    >
      <div class="flex flex-col truncate">
        <span class="text-xs text-muted font-normal">محتوى الرمز:</span>
        <span class="truncate">{{ qrData }}</span>
      </div>
      <UButton
        size="xs"
        variant="outline"
        color="primary"
        icon="i-lucide-copy"
        label="نسخ النص"
        @click="copyToClipboard"
      />
    </div>

    <UModal
      v-model:open="generateModal"
      title="إنشاء رمز استجابة سريعة"
    >
      <template #body>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onGenerate"
        >
          <UFormField
            label="النص أو الرابط"
            name="text"
          >
            <UInput
              v-model="state.text"
              placeholder="اكتب الرابط أو النص هنا..."
              class="block w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            class="mt-3 w-full justify-center"
          >
            توليد الرمز
          </UButton>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

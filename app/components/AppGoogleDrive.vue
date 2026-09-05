<template>
  <div
    dir="rtl"
    class="w-full min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-6xl w-full mx-auto space-y-8">
      <!-- Hero Header Section -->
      <div class="text-center space-y-4 max-w-3xl mx-auto">
        <UBadge
          color="primary"
          variant="subtle"
          size="md"
          class="rounded-full px-4 py-1"
        >
          <UIcon
            name="i-lucide-hard-drive"
            class="size-4 ml-1.5"
          />
          مساحتك السحابية الخاصة
        </UBadge>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight">
          <div>
            إدارة ملفاتك ومجلداتك عبر
          </div>
          <span class="text-primary-500">
            Google Drive
            <UIcon
              name="i-simple-icons-googledrive"
              class="size-12 inline-block align-middle"
            />
          </span>
        </h1>
        <p class="text-base sm:text-lg">
          إنشاء المجلدات والملفات، التحكم في خيارات المشاركة والحذف، وتصفح مستنداتك بسلاسة.
        </p>

        <!-- CTA Login Button -->
        <div
          v-if="!loggedIn"
          class="pt-2"
        >
          <UButton
            to="/api/auth/google"
            external
            color="primary"
            size="xl"
            icon="i-lucide-log-in"
            class="font-bold px-8 rounded-xl"
          >
            تسجيل الدخول باستخدام Google
          </UButton>
        </div>
      </div>

      <!-- Main Authenticated Drive Experience -->
      <template v-if="loggedIn">
        <!-- Profile & Top Bar Control -->
        <UCard class="border border-default rounded-2xl">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <UAvatar
                :src="userPicture"
                :alt="userName"
                size="lg"
              />
              <div>
                <h3 class="font-bold text-gray-900 text-base">
                  {{ userName }}
                </h3>
                <p class="text-xs text-gray-500">
                  {{ (user as { email?: string } | null)?.email }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-refresh-cw"
                :loading="refreshing"
                @click="refreshFiles"
              >
                <span class="hidden xl:inline">تحديث البيانات</span>
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-log-out"
                @click="logout"
              >
                <span class="hidden xl:inline">تسجيل الخروج</span>
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Actions & Files Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Actions & Upload Side Column -->
          <div class="space-y-4">
            <!-- Fast Creation Actions -->
            <UCard class="border border-default rounded-2xl">
              <template #header>
                <h3 class="font-bold text-gray-900 flex items-center gap-2">
                  <UIcon
                    name="i-lucide-plus-circle"
                    class="size-5 text-primary-500"
                  />
                  إجراءات سريعة
                </h3>
              </template>
              <div class="grid grid-cols-1 gap-2">
                <UButton
                  color="primary"
                  variant="soft"
                  icon="i-lucide-folder-plus"
                  @click="isCreateFolderOpen = true"
                >
                  مجلد جديد
                </UButton>
              </div>
            </UCard>

            <!-- File Upload Widget -->
            <UCard class="border border-default rounded-2xl">
              <template #header>
                <h3 class="font-bold text-gray-900 flex items-center gap-2">
                  <UIcon
                    name="i-lucide-upload-cloud"
                    class="size-5 text-primary-500"
                  />
                  رفع ملف
                </h3>
              </template>

              <form
                class="space-y-4"
                @submit.prevent="uploadFile"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  class="hidden"
                  @change="onFileChange"
                >
                <div
                  class="border-2 border-dashed border-default rounded-xl p-5 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
                  @click="triggerFileInput"
                >
                  <UIcon
                    name="i-lucide-file-up"
                    class="size-8 text-gray-400 mx-auto mb-2"
                  />
                  <p class="text-xs font-semibold text-gray-700">
                    {{ selectedFile ? selectedFile.name : 'اضغط لاختيار ملف للرفع' }}
                  </p>
                  <p
                    v-if="selectedFile"
                    class="text-[11px] text-gray-400 mt-1"
                  >
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>

                <div
                  v-if="selectedFile"
                  class="flex gap-2"
                >
                  <UButton
                    type="submit"
                    block
                    color="primary"
                    :loading="uploading"
                    icon="i-lucide-upload"
                  >
                    تأكيد الرفع
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="resetSelectedFile"
                  />
                </div>
              </form>
            </UCard>
          </div>

          <!-- Files & Folders Directory Explorer -->
          <UCard class="lg:col-span-2 border border-default rounded-2xl">
            <template #header>
              <div class="flex items-center justify-between">
                <!-- Breadcrumbs Directory Trail -->
                <div class="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  <UIcon
                    name="i-lucide-folder"
                    class="size-5 text-amber-500"
                  />
                  <span
                    class="cursor-pointer hover:underline"
                    @click="navigateToDirectory('root')"
                  >الملفات الرئيسية</span>
                  <template
                    v-for="(folder, idx) in currentPath"
                    :key="folder.id"
                  >
                    <span class="text-gray-400">/</span>
                    <span
                      class="cursor-pointer hover:underline"
                      @click="navigateToPathIndex(idx)"
                    >{{ folder.name }}</span>
                  </template>
                </div>

                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ files.length }} عنصر
                </UBadge>
              </div>
            </template>

            <!-- Loading Spinner -->
            <div
              v-if="loading"
              class="py-16 text-center"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-8 text-primary-500 animate-spin mx-auto mb-2"
              />
              <p class="text-xs text-gray-400">
                جاري جلب المحتويات...
              </p>
            </div>

            <!-- Empty Directory -->
            <div
              v-else-if="files.length === 0"
              class="py-16 text-center text-gray-400 space-y-2"
            >
              <UIcon
                name="i-lucide-folder-open"
                class="size-12 mx-auto opacity-30"
              />
              <p class="text-sm">
                هذا المجلد فارغ حالياً
              </p>
            </div>

            <!-- Files and Folders Listing -->
            <div
              v-else
              class="divide-y divide-gray-100"
            >
              <div
                v-for="item in files"
                :key="item.id"
                class="py-3 px-2 flex items-center justify-between gap-3 hover:bg-gray-50/80 rounded-lg transition-colors group"
              >
                <!-- Item Type Icon & Title -->
                <div
                  class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  @click="item.isFolder ? openFolder(item) : null"
                >
                  <div :class="['size-10 rounded-lg flex items-center justify-center shrink-0', item.isFolder ? 'bg-amber-50 text-amber-500' : 'bg-primary-50 text-primary-500']">
                    <UIcon
                      :name="item.isFolder ? 'i-lucide-folder' : getFileIcon(item.mimeType)"
                      class="size-5"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate group-hover:text-primary-500 transition-colors">
                      {{ item.name }}
                    </p>
                    <p class="text-[11px] text-gray-400">
                      {{ item.isFolder ? 'مجلد' : formatFileSize(Number(item.size)) }} • {{ formatDate(item.modifiedTime) }}
                    </p>
                  </div>
                </div>

                <!-- Item Actions -->
                <div class="flex items-center gap-1 shrink-0">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-share-2"
                    title="خيارات المشاركة"
                    @click="openShareModal(item)"
                  />
                  <UButton
                    v-if="item.webViewLink"
                    :to="item.webViewLink"
                    target="_blank"
                    color="primary"
                    variant="subtle"
                    size="xs"
                    icon="i-lucide-external-link"
                  >
                    فتح
                  </UButton>
                  <!-- زر الحذف -->
                  <UButton
                    color="error"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-trash-2"
                    title="حذف العنصر"
                    @click="confirmDelete(item)"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>

      <!-- Modal: إنشاء مجلد جديد -->
      <UModal
        v-model:open="isCreateFolderOpen"
        title="إنشاء مجلد جديد"
      >
        <template #content>
          <form
            class="p-6 space-y-4"
            @submit.prevent="createFolder"
          >
            <UInput
              v-model="newFolderName"
              placeholder="اسم المجلد"
              class="w-full"
              required
              autofocus
            />
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isCreateFolderOpen = false"
              >
                إلغاء
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="creatingFolder"
              >
                إنشاء
              </UButton>
            </div>
          </form>
        </template>
      </UModal>

      <!-- Modal: إنشاء ملف نصي جديد -->
      <UModal
        v-model:open="isCreateFileOpen"
        title="إنشاء ملف نصي جديد"
      >
        <template #content>
          <form
            class="p-6 space-y-4"
            @submit.prevent="createFile"
          >
            <UInput
              v-model="newFileName"
              placeholder="اسم الملف (مثال: document.txt)"
              required
              autofocus
            />
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isCreateFileOpen = false"
              >
                إلغاء
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="creatingFile"
              >
                إنشاء
              </UButton>
            </div>
          </form>
        </template>
      </UModal>

      <!-- Modal: تأكيد الحذف -->
      <UModal
        v-model:open="isDeleteModalOpen"
        title="تأكيد الحذف"
      >
        <template #content>
          <div
            dir="rtl"
            class="p-6 space-y-4"
          >
            <p class="text-sm text-gray-700">
              هل أنت تأكد من رغبتك في حذف <span class="font-bold text-gray-900">{{ itemToDelete?.name }}</span>؟
            </p>
            <p
              v-if="itemToDelete?.isFolder"
              class="text-xs text-red-500"
            >
              ملاحظة: حذف المجلد يؤدي إلى حذف كافة العناصر بداخله.
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isDeleteModalOpen = false"
              >
                إلغاء
              </UButton>
              <UButton
                color="error"
                :loading="deleting"
                icon="i-lucide-trash-2"
                @click="deleteItem"
              >
                تأكيد الحذف
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Modal: إعدادات المشاركة المتقدمة -->
      <UModal
        v-model:open="isShareModalOpen"
        :title="`مشاركة ${selectedShareItem?.isFolder ? 'المجلد' : 'الملف'}: ${selectedShareItem?.name}`"
      >
        <template #content>
          <div
            dir="rtl"
            class="p-6 space-y-6"
          >
            <div class="space-y-3">
              <h4 class="text-sm font-bold text-gray-900">
                الوصول العام
              </h4>

              <div class="p-4 rounded-xl border border-default space-y-4 bg-gray-50/50">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="shareAccessType"
                    type="radio"
                    name="accessType"
                    value="restricted"
                    class="mt-1 text-primary-500 focus:ring-primary-500"
                  >
                  <div>
                    <div class="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                      <UIcon
                        name="i-lucide-lock"
                        class="size-4 text-gray-500"
                      />
                      حصري (Restricted)
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">
                      يمكن فقط للأشخاص الذين يمتلكون الإذن فتح هذا الرابط.
                    </p>
                  </div>
                </label>

                <div class="border-t border-default" />

                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="shareAccessType"
                    type="radio"
                    name="accessType"
                    value="anyone"
                    class="mt-1 text-primary-500 focus:ring-primary-500"
                  >
                  <div class="flex-1">
                    <div class="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                      <UIcon
                        name="i-lucide-globe"
                        class="size-4 text-emerald-500"
                      />
                      أي شخص لديه الرابط (Anyone with the link)
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">
                      يمكن لأي شخص لديه هذا الرابط الوصول بدون تسجيل الدخول.
                    </p>

                    <div
                      v-if="shareAccessType === 'anyone'"
                      class="mt-3 flex items-center gap-2"
                    >
                      <span class="text-xs text-gray-600">الصلاحية:</span>
                      <select
                        v-model="shareRole"
                        class="text-xs border border-default rounded-lg p-1.5 bg-white text-gray-900 font-medium focus:outline-none"
                      >
                        <option value="viewer">مشاهد (Viewer)</option>
                        <option value="commenter">معلّق (Commenter)</option>
                        <option value="editor">محرر (Editor)</option>
                      </select>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-copy"
                size="sm"
                @click="copyShareLink(selectedShareItem?.webViewLink || '')"
              >
                نسخ الرابط
              </UButton>

              <div class="flex gap-2">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="isShareModalOpen = false"
                >
                  إلغاء
                </UButton>
                <UButton
                  color="primary"
                  :loading="savingShare"
                  icon="i-lucide-check"
                  @click="saveShareSettings"
                >
                  حفظ التغييرات
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </UModal>

      <UToaster />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUserSession } from '#imports'

interface DriveItem {
  id: string
  name: string
  mimeType: string
  size: string
  modifiedTime: string
  webViewLink: string
  isFolder: boolean
}

const { loggedIn, user, clear } = useUserSession()
const userPicture = computed(() => (user.value as { picture?: string } | null)?.picture)
const userName = computed(() => (user.value as { name?: string } | null)?.name)

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const files = ref<DriveItem[]>([])
const loading = ref(true)
const refreshing = ref(false)

// Folder Nav State
const currentFolderId = ref('root')
const currentPath = ref<Array<{ id: string, name: string }>>([])

// Modals State
const isCreateFolderOpen = ref(false)
const newFolderName = ref('')
const creatingFolder = ref(false)

const isCreateFileOpen = ref(false)
const newFileName = ref('')
const creatingFile = ref(false)

// Delete State
const isDeleteModalOpen = ref(false)
const itemToDelete = ref<DriveItem | null>(null)
const deleting = ref(false)

// Share State
const isShareModalOpen = ref(false)
const selectedShareItem = ref<DriveItem | null>(null)
const shareAccessType = ref<'restricted' | 'anyone'>('restricted')
const shareRole = ref<'viewer' | 'commenter' | 'editor'>('viewer')
const savingShare = ref(false)

const toast = useToast()

const triggerFileInput = () => fileInputRef.value?.click()

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const resetSelectedFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 بايت'
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const formatDate = (isoString?: string): string => {
  if (!isoString) return '-'
  return new Intl.DateTimeFormat('ar-SA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(isoString))
}

const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('image')) return 'i-lucide-image'
  if (mimeType.includes('pdf')) return 'i-lucide-file-text'
  if (mimeType.includes('video')) return 'i-lucide-video'
  return 'i-lucide-file'
}

// Nav
const openFolder = (folder: DriveItem) => {
  currentFolderId.value = folder.id
  currentPath.value.push({ id: folder.id, name: folder.name })
  refreshFiles()
}

const navigateToDirectory = (folderId: string) => {
  currentFolderId.value = folderId
  currentPath.value = []
  refreshFiles()
}

const navigateToPathIndex = (index: number) => {
  const targetFolder = currentPath.value[index]
  if (!targetFolder) return
  currentFolderId.value = targetFolder.id
  currentPath.value = currentPath.value.slice(0, index + 1)
  refreshFiles()
}

// Create
const createFolder = async () => {
  if (!newFolderName.value) return
  creatingFolder.value = true
  try {
    await $fetch('/api/drive/create', {
      method: 'POST',
      body: { name: newFolderName.value, type: 'folder', folderId: currentFolderId.value }
    })
    newFolderName.value = ''
    isCreateFolderOpen.value = false
    await refreshFiles()
  } finally {
    creatingFolder.value = false
  }
}

const createFile = async () => {
  if (!newFileName.value) return
  creatingFile.value = true
  try {
    await $fetch('/api/drive/create', {
      method: 'POST',
      body: { name: newFileName.value, type: 'file', folderId: currentFolderId.value }
    })
    newFileName.value = ''
    isCreateFileOpen.value = false
    await refreshFiles()
  } finally {
    creatingFile.value = false
  }
}

// Delete Logic
const confirmDelete = (item: DriveItem) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const deleteItem = async () => {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/drive/delete?fileId=${itemToDelete.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'تم حذف العنصر بنجاح',
      color: 'success'
    })

    isDeleteModalOpen.value = false
    itemToDelete.value = null
    await refreshFiles()
  } catch {
    toast.add({
      title: 'فشل في حذف العنصر',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

// Share
const openShareModal = (item: DriveItem) => {
  selectedShareItem.value = item
  shareAccessType.value = 'restricted'
  shareRole.value = 'viewer'
  isShareModalOpen.value = true
}

const saveShareSettings = async () => {
  if (!selectedShareItem.value) return

  savingShare.value = true
  try {
    await $fetch('/api/drive/share', {
      method: 'POST',
      body: {
        fileId: selectedShareItem.value.id,
        accessType: shareAccessType.value,
        role: shareRole.value
      }
    })

    toast.add({
      title: shareAccessType.value === 'anyone' ? 'تم تحويل الوصول إلى: أي شخص لديه الرابط' : 'تم تحويل الوصول إلى: حصري',
      color: 'success'
    })

    isShareModalOpen.value = false
    await refreshFiles()
  } catch {
    toast.add({
      title: 'فشل في تحديث خيارات المشاركة',
      color: 'error'
    })
  } finally {
    savingShare.value = false
  }
}

const copyShareLink = (link: string) => {
  if (!link) return
  navigator.clipboard.writeText(link)
  toast.add({
    title: 'تم نسخ الرابط بنجاح!',
    color: 'success'
  })
}

// Upload & Fetch
const uploadFile = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value, selectedFile.value.name)
    formData.append('folderId', currentFolderId.value)

    await $fetch('/api/drive/upload', { method: 'POST', body: formData })
    resetSelectedFile()
    await refreshFiles()
  } finally {
    uploading.value = false
  }
}

const refreshFiles = async () => {
  refreshing.value = true
  try {
    const data = await $fetch<{
      files?: Array<{
        id: string
        name: string
        mimeType: string
        size?: string | number
        modifiedTime?: string
        webViewLink?: string
      }>
    }>(`/api/drive/files?folderId=${currentFolderId.value}`)
    files.value = (data.files || []).map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: String(file.size || '0'),
      modifiedTime: file.modifiedTime || '',
      webViewLink: file.webViewLink || '',
      isFolder: file.mimeType === 'application/vnd.google-apps.folder'
    }))
  } catch (err) {
    console.error('Failed to fetch files:', err)
  } finally {
    refreshing.value = false
  }
}

const logout = async () => {
  await clear()
  files.value = []
}

onMounted(async () => {
  if (loggedIn.value) {
    await refreshFiles()
  }
  loading.value = false
})
</script>

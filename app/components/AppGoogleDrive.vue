<template>
  <div
    dir="rtl"
    class="w-full flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-6xl w-full mx-auto space-y-8">
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
        <h1 class="text-2xl sm:text-5xl font-black tracking-tight">
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
        <p class="text-base sm:text-lg text-default">
          إنشاء المجلدات والملفات، التحكم في خيارات المشاركة والحذف، وتصفح مستنداتك بسلاسة.
        </p>

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

      <template v-if="loggedIn">
        <UCard class="border border-default rounded-2xl">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <UAvatar
                :src="userPicture"
                :alt="userName"
                size="lg"
              />
              <div>
                <h3 class="font-bold text-default text-base">
                  {{ userName }}
                </h3>
                <p class="text-xs text-accented">
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="space-y-4">
            <UCard class="border border-default rounded-2xl">
              <template #header>
                <h3 class="font-bold text-default flex items-center gap-2">
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

            <UCard class="border border-default rounded-2xl">
              <template #header>
                <h3 class="font-bold text-default flex items-center gap-2">
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
                  multiple
                  class="hidden"
                  @change="onFileChange"
                >
                <div
                  class="border-2 border-dashed border-default rounded-xl p-5 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
                  @click="triggerFileInput"
                >
                  <UIcon
                    name="i-lucide-file-up"
                    class="size-8 text-accented mx-auto mb-2"
                  />
                  <p class="text-xs font-semibold text-default">
                    {{ selectedFiles.length === 0 ? 'اضغط لاختيار ملفات للرفع' : `${selectedFiles.length} ملف مختار` }}
                  </p>
                  <p
                    v-if="selectedFiles.length === 0"
                    class="text-[11px] text-accented mt-1"
                  >
                    يمكنك اختيار أكثر من ملف
                  </p>
                </div>

                <div
                  v-if="selectedFiles.length > 0 && !uploading"
                  class="space-y-2"
                >
                  <div class="max-h-40 overflow-y-auto space-y-1">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="flex items-center justify-between bg-default/5 rounded-lg px-3 py-2 text-xs"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <UIcon
                          name="i-lucide-file"
                          class="size-4 shrink-0"
                        />
                        <span class="truncate">{{ file.name }}</span>
                        <span class="text-accented">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <UButton
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="removeSelectedFile(index)"
                      />
                    </div>
                  </div>
                  <UButton
                    type="submit"
                    block
                    color="primary"
                    icon="i-lucide-upload"
                  >
                    تأكيد رفع {{ selectedFiles.length }} ملف
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    block
                    icon="i-lucide-x"
                    @click="resetSelectedFiles"
                  />
                </div>

                <div
                  v-if="uploading"
                  class="space-y-2"
                >
                  <div class="flex items-center justify-between text-xs text-default">
                    <span>جاري الرفع...</span>
                    <div class="flex items-center gap-2">
                      <span>{{ uploadProgress }}% {{ uploadSpeed ? '• ' + uploadSpeed : '' }} {{ timeRemaining ? '• متبقي: ' + timeRemaining : '' }}</span>
                      <UButton
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="cancelUpload"
                      />
                    </div>
                  </div>
                  <div class="h-2 bg-default/20 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 transition-all duration-300 ease-out"
                      :style="{ width: `${uploadProgress}%` }"
                    />
                  </div>
                </div>
              </form>
            </UCard>
          </div>

          <UCard class="lg:col-span-2 border border-default rounded-2xl">
            <template #header>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 text-sm font-bold text-default">
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
                    <span class="text-accented">/</span>
                    <span
                      class="cursor-pointer hover:underline"
                      @click="navigateToPathIndex(idx)"
                    >{{ folder.name }}</span>
                  </template>
                </div>

                <div class="flex items-center gap-2">
                  <UInput
                    v-model="searchQuery"
                    icon="i-lucide-search"
                    placeholder="بحث في الملفات..."
                    size="xs"
                    class="w-full sm:w-48"
                    :disabled="loading || files.length === 0"
                  />
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ filteredFiles.length }} عنصر
                  </UBadge>
                </div>
              </div>
            </template>

            <div
              v-if="loading"
              class="py-16 text-center"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-8 text-primary-500 animate-spin mx-auto mb-2"
              />
              <p class="text-xs text-accented">
                جاري جلب المحتويات...
              </p>
            </div>

            <div
              v-else-if="files.length === 0"
              class="py-16 text-center text-accented space-y-2"
            >
              <UIcon
                name="i-lucide-folder-open"
                class="size-12 mx-auto opacity-30"
              />
              <p class="text-sm">
                هذا المجلد فارغ حالياً
              </p>
            </div>

            <div
              v-else
              class="divide-y divide-accented"
            >
              <div
                v-if="selectedCount > 0"
                class="py-2 px-2 flex items-center justify-between gap-3 bg-primary-500/5 rounded-lg"
              >
                <UCheckbox
                  :model-value="selectedCount === filteredFiles.length && filteredFiles.length > 0"
                  :indeterminate="selectedCount > 0 && selectedCount < filteredFiles.length"
                  label="تحديد الكل"
                  @update:model-value="val => val ? filteredFiles.forEach(f => toggleSelect(f.id)) : clearSelection()"
                />
                <div class="flex items-center gap-1.5">
                  <UButton
                    size="xs"
                    color="error"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    @click="confirmBatchDelete"
                  >
                    حذف المحدد ({{ selectedCount }})
                  </UButton>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="clearSelection"
                  />
                </div>
              </div>

              <div
                v-for="item in filteredFiles"
                :key="item.id"
                class="py-3 px-2 flex items-center justify-between gap-3 hover:bg-accented/80 rounded-lg transition-colors group"
                :class="{ 'bg-primary-500/5': isSelected(item.id) }"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <UCheckbox
                    :model-value="isSelected(item.id)"
                    @update:model-value="() => toggleSelect(item.id)"
                    @click.stop
                  />
                  <div
                    class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    @click="item.isFolder ? openFolder(item) : null"
                  >
                    <div :class="['size-10 rounded-lg flex items-center justify-center shrink-0', item.isFolder ? 'bg-amber-500/10 text-amber-500' : 'bg-primary-500/10 text-primary-500']">
                      <UIcon
                        :name="item.isFolder ? 'i-lucide-folder' : getFileIcon(item.mimeType)"
                        class="size-5"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-default truncate group-hover:text-primary-500 transition-colors">
                        {{ item.name }}
                      </p>
                      <p class="text-[11px] text-accented">
                        {{ item.isFolder ? 'مجلد' : formatFileSize(Number(item.size)) }} • {{ formatDate(item.modifiedTime) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <UButton
                    v-if="!item.isFolder && item.webViewLink"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-download"
                    title="تنزيل"
                    @click="downloadFile(item)"
                  />
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-pencil"
                    title="إعادة تسمية"
                    @click="openRenameModal(item)"
                  />
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

      <UModal
        v-model:open="isBatchDeleteModalOpen"
        title="تأكيد حذف متعدد"
      >
        <template #content>
          <div
            dir="rtl"
            class="p-6 space-y-4"
          >
            <p class="text-sm text-default">
              هل أنت تأكد من رغبتك في حذف <span class="font-bold text-default">{{ selectedCount }}</span> عنصر؟
            </p>
            <p class="text-xs text-red-500">
              ملاحظة: حذف المجلدات يؤدي إلى حذف كافة العناصر بداخلها.
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isBatchDeleteModalOpen = false"
              >
                إلغاء
              </UButton>
              <UButton
                color="error"
                :loading="batchDeleting"
                icon="i-lucide-trash-2"
                @click="batchDeleteItems"
              >
                تأكيد الحذف
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <UModal
        v-model:open="isDeleteModalOpen"
        title="تأكيد الحذف"
      >
        <template #content>
          <div
            dir="rtl"
            class="p-6 space-y-4"
          >
            <p class="text-sm text-default">
              هل أنت تأكد من رغبتك في حذف <span class="font-bold text-default">{{ itemToDelete?.name }}</span>؟
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

      <UModal
        v-model:open="isRenameModalOpen"
        title="إعادة تسمية"
      >
        <template #content>
          <div
            dir="rtl"
            class="p-6 space-y-4"
          >
            <UInput
              v-model="newItemName"
              placeholder="الاسم الجديد"
              class="w-full"
              required
              autofocus
              @keyup.enter="renameItem"
            />
            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isRenameModalOpen = false"
              >
                إلغاء
              </UButton>
              <UButton
                color="primary"
                :loading="renaming"
                icon="i-lucide-check"
                @click="renameItem"
              >
                حفظ
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

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
              <h4 class="text-sm font-bold text-default">
                الوصول العام
              </h4>

              <div class="p-4 rounded-xl border border-default space-y-4 bg-accented/50">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="shareAccessType"
                    type="radio"
                    name="accessType"
                    value="restricted"
                    class="mt-1 text-primary-500 focus:ring-primary-500"
                  >
                  <div>
                    <div class="flex items-center gap-1.5 font-bold text-sm text-default">
                      <UIcon
                        name="i-lucide-lock"
                        class="size-4 text-accented"
                      />
                      حصري (Restricted)
                    </div>
                    <p class="text-xs text-accented mt-0.5">
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
                    <div class="flex items-center gap-1.5 font-bold text-sm text-default">
                      <UIcon
                        name="i-lucide-globe"
                        class="size-4 text-emerald-500"
                      />
                      أي شخص لديه الرابط (Anyone with the link)
                    </div>
                    <p class="text-xs text-accented mt-0.5">
                      يمكن لأي شخص لديه هذا الرابط الوصول بدون تسجيل الدخول.
                    </p>

                    <div
                      v-if="shareAccessType === 'anyone'"
                      class="mt-3 flex items-center gap-2"
                    >
                      <span class="text-xs text-accented">الصلاحية:</span>
                      <select
                        v-model="shareRole"
                        class="text-xs border border-default rounded-lg p-1.5 bg-default text-default font-medium focus:outline-none"
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
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-qr-code"
                size="sm"
                :disabled="!selectedShareItem?.webViewLink"
                @click="openQrModal(selectedShareItem?.webViewLink || '')"
              >
                رمز QR
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

      <AppQrModal
        v-model:open="isQrModalOpen"
        :text="qrText"
        title="رمز الاستجابة السريعة للرابط"
      />
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
  permissions?: Array<{ id: string, type: string, role: string }>
}

const { loggedIn, user, clear } = useUserSession()
const userPicture = computed(() => (user.value as { picture?: string } | null)?.picture)
const userName = computed(() => (user.value as { name?: string } | null)?.name)

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const files = ref<DriveItem[]>([])
const loading = ref(true)
const refreshing = ref(false)

// Folder Nav State
const currentFolderId = ref('root')
const currentPath = ref<Array<{ id: string, name: string }>>([])
const searchQuery = ref('')

const filteredFiles = computed(() => {
  if (!searchQuery.value.trim()) return files.value
  const q = searchQuery.value.trim().toLowerCase()
  return files.value.filter(f => f.name.toLowerCase().includes(q))
})

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

const isBatchDeleteModalOpen = ref(false)
const selectedItemIds = ref<Set<string>>(new Set())
const batchDeleting = ref(false)

// Rename State
const isRenameModalOpen = ref(false)
const itemToRename = ref<DriveItem | null>(null)
const newItemName = ref('')
const renaming = ref(false)

// Share State
const isShareModalOpen = ref(false)
const selectedShareItem = ref<DriveItem | null>(null)
const shareAccessType = ref<'restricted' | 'anyone'>('restricted')
const shareRole = ref<'viewer' | 'commenter' | 'editor'>('viewer')
const savingShare = ref(false)

const isQrModalOpen = ref(false)
const qrText = ref('')

const openQrModal = (text: string) => {
  qrText.value = text || ''
  isQrModalOpen.value = true
}

const toast = useToast()

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  selectedFiles.value = Array.from(target.files || [])
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const resetSelectedFiles = () => {
  selectedFiles.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const cancelUpload = () => {
  uploading.value = false
  uploadProgress.value = 0
  uploadSpeed.value = ''
  timeRemaining.value = ''
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
  searchQuery.value = ''
  clearSelection()
  refreshFiles()
}

const navigateToDirectory = (folderId: string) => {
  currentFolderId.value = folderId
  currentPath.value = []
  searchQuery.value = ''
  clearSelection()
  refreshFiles()
}

const navigateToPathIndex = (index: number) => {
  const targetFolder = currentPath.value[index]
  if (!targetFolder) return
  currentFolderId.value = targetFolder.id
  currentPath.value = currentPath.value.slice(0, index + 1)
  searchQuery.value = ''
  clearSelection()
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

const selectedCount = computed(() => selectedItemIds.value.size)

const toggleSelect = (id: string) => {
  const set = new Set(selectedItemIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedItemIds.value = set
}

const isSelected = (id: string) => selectedItemIds.value.has(id)

const clearSelection = () => {
  selectedItemIds.value = new Set()
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
    clearSelection()
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

const confirmBatchDelete = () => {
  if (selectedCount.value === 0) return
  isBatchDeleteModalOpen.value = true
}

const batchDeleteItems = async () => {
  if (selectedCount.value === 0) return

  batchDeleting.value = true
  try {
    const ids = Array.from(selectedItemIds.value)
    await $fetch('/api/drive/delete', {
      method: 'DELETE',
      body: { fileIds: ids }
    })

    toast.add({
      title: `تم حذف ${ids.length} عنصر بنجاح`,
      color: 'success'
    })

    isBatchDeleteModalOpen.value = false
    clearSelection()
    await refreshFiles()
  } catch {
    toast.add({
      title: 'فشل في حذف العناصر المحددة',
      color: 'error'
    })
  } finally {
    batchDeleting.value = false
  }
}

// Share
const openShareModal = (item: DriveItem) => {
  selectedShareItem.value = item
  const anyonePermission = item.permissions?.find(p => p.type === 'anyone')

  if (anyonePermission) {
    shareAccessType.value = 'anyone'
    const googleRole = anyonePermission.role
    if (googleRole === 'writer') shareRole.value = 'editor'
    else if (googleRole === 'commenter') shareRole.value = 'commenter'
    else shareRole.value = 'viewer'
  } else {
    shareAccessType.value = 'restricted'
    shareRole.value = 'viewer'
  }

  isShareModalOpen.value = true
}

// Rename Logic
const openRenameModal = (item: DriveItem) => {
  itemToRename.value = item
  newItemName.value = item.name
  isRenameModalOpen.value = true
}

const renameItem = async () => {
  if (!itemToRename.value || !newItemName.value.trim()) return

  renaming.value = true
  try {
    await $fetch('/api/drive/rename', {
      method: 'POST',
      body: {
        fileId: itemToRename.value.id,
        name: newItemName.value.trim()
      }
    })

    toast.add({
      title: 'تم إعادة تسمية العنصر بنجاح',
      color: 'success'
    })

    isRenameModalOpen.value = false
    itemToRename.value = null
    newItemName.value = ''
    await refreshFiles()
  } catch {
    toast.add({
      title: 'فشل في إعادة تسمية العنصر',
      color: 'error'
    })
  } finally {
    renaming.value = false
  }
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

const downloadFile = async (item: DriveItem) => {
  if (item.isFolder) return
  try {
    const url = `/api/drive/download?fileId=${item.id}`
    const a = document.createElement('a')
    a.href = url
    a.download = item.name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.add({ title: 'تم بدء تنزيل الملف', color: 'success' })
  } catch {
    toast.add({ title: 'فشل في تنزيل الملف', color: 'error' })
  }
}

// Upload & Fetch
const uploadProgress = ref(0)
const uploadSpeed = ref('')
const timeRemaining = ref('')

const uploadFile = async () => {
  if (selectedFiles.value.length === 0) return
  uploading.value = true
  uploadProgress.value = 0
  uploadSpeed.value = ''
  timeRemaining.value = ''

  try {
    const totalBytes = selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
    let uploadedBytes = 0
    const startTime = Date.now()

    for (const file of selectedFiles.value) {
      const { uploadUrl } = await $fetch<{ uploadUrl: string }>('/api/drive/upload?action=create-session', {
        method: 'POST',
        body: {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          folderId: currentFolderId.value
        }
      })

      const CHUNK_SIZE = 2 * 1024 * 1024
      const fileSize = file.size
      let chunkStart = 0

      while (chunkStart < fileSize) {
        const end = Math.min(chunkStart + CHUNK_SIZE, fileSize)
        const chunk = file.slice(chunkStart, end)

        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('uploadUrl', uploadUrl)
        formData.append('contentRange', `bytes ${chunkStart}-${end - 1}/${fileSize}`)

        await $fetch('/api/drive/upload', {
          method: 'POST',
          body: formData
        })

        const chunkBytes = end - chunkStart
        uploadedBytes += chunkBytes
        chunkStart = end

        uploadProgress.value = Math.round((uploadedBytes / totalBytes) * 100)

        const elapsedSeconds = (Date.now() - startTime) / 1000
        const speed = elapsedSeconds > 0 ? uploadedBytes / elapsedSeconds : 0
        const remainingBytes = totalBytes - uploadedBytes
        const remainingSeconds = speed > 0 ? remainingBytes / speed : 0

        uploadSpeed.value = speed > 1024 * 1024
          ? `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
          : `${(speed / 1024).toFixed(0)} KB/s`

        timeRemaining.value = remainingSeconds < 60
          ? `${Math.ceil(remainingSeconds)} ثانية`
          : `${Math.ceil(remainingSeconds / 60)} دقيقة`
      }
    }

    const uploadedCount = selectedFiles.value.length
    toast.add({ title: `تم رفع ${uploadedCount} ملف بنجاح`, color: 'success' })
    resetSelectedFiles()
    await refreshFiles()
  } catch (err) {
    console.error('Chunk Proxy Upload Error:', err)
    toast.add({ title: 'فشل في رفع الملفات، يرجى المحاولة لاحقاً', color: 'error' })
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
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      permissions: (file as { permissions?: Array<{ id: string, type: string, role: string }> }).permissions || []
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

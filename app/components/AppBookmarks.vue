<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface BookmarkItem {
  id?: string
  label: string
  link: string
  icon?: string
  isCustom?: boolean
}

interface BookmarkCategory {
  category: string
  icon: string
  isCustom?: boolean
  child: BookmarkItem[]
}

const toast = useToast()
const addModal = ref(false)
const categoryModal = ref(false)
const searchQuery = ref('')

const newBookmark = reactive({
  category: '',
  label: '',
  link: ''
})

const newCategory = reactive({
  name: '',
  icon: 'i-lucide-folder'
})

const presetIcons = [
  { label: 'مجلد', name: 'i-lucide-folder' },
  { label: 'أدوات', name: 'i-lucide-wrench' },
  { label: 'تطوير', name: 'i-lucide-code' },
  { label: 'تسوق', name: 'i-lucide-shopping-bag' },
  { label: 'تعليم', name: 'i-lucide-graduation-cap' },
  { label: 'ألعاب', name: 'i-lucide-gamepad-2' },
  { label: 'وسائط', name: 'i-lucide-video' },
  { label: 'أخبار', name: 'i-lucide-newspaper' },
  { label: 'نجوم', name: 'i-lucide-star' },
  { label: 'رابط', name: 'i-lucide-globe' }
]

const getFaviconUrl = (url: string) => {
  if (!url || typeof url !== 'string') return ''
  try {
    const validUrl = url.includes('://') ? url : `https://${url}`
    const urlObj = new URL(validUrl)

    if (urlObj.hostname.endsWith('.gov.sa') || urlObj.hostname.endsWith('.madrasati.sa')) {
      return 'i-lucide-landmark'
    }

    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
  } catch {
    return ''
  }
}

const defaultBookmarks: BookmarkCategory[] = [
  {
    category: 'مواقع الذكاء الاصطناعي',
    icon: 'i-lucide-bot',
    child: [
      { label: 'DeepSeek', link: 'https://chat.deepseek.com', icon: getFaviconUrl('https://chat.deepseek.com') },
      { label: 'Kimi AI (Moonshot)', link: 'https://kimi.moonshot.cn', icon: getFaviconUrl('https://kimi.moonshot.cn') },
      { label: 'Qwen (Alibaba)', link: 'https://chat.qwenlm.ai', icon: getFaviconUrl('https://chat.qwenlm.ai') },
      { label: 'ChatGPT', link: 'https://chatgpt.com', icon: 'i-simple-icons-openai' },
      { label: 'Google Gemini', link: 'https://gemini.google.com', icon: 'i-simple-icons-googlegemini' },
      { label: 'Microsoft Copilot', link: 'https://copilot.microsoft.com', icon: 'i-simple-icons-githubcopilot' },
      { label: 'Gamma (عروض تقديمية)', link: 'https://gamma.app', icon: getFaviconUrl('https://gamma.app') }
    ]
  },
  {
    category: 'مواقع التصميم',
    icon: 'i-lucide-palette',
    child: [
      { label: 'كانفا', link: 'https://www.canva.com', icon: getFaviconUrl('https://www.canva.com') },
      { label: 'Photopea', link: 'https://www.photopea.com', icon: getFaviconUrl('https://www.photopea.com') },
      { label: 'فيجما', link: 'https://www.figma.com', icon: getFaviconUrl('https://www.figma.com') },
      { label: 'بيهانس', link: 'https://www.behance.net', icon: getFaviconUrl('https://www.behance.net') }
    ]
  },
  {
    category: 'تطوير مهني',
    icon: 'i-lucide-code',
    child: [
      { label: 'إثرائي', link: 'https://ethrai.sa', icon: getFaviconUrl('https://ethrai.sa') },
      { label: 'دروب', link: 'https://doroob.sa/ar/', icon: getFaviconUrl('https://doroob.sa/ar/') },
      { label: 'المعهد الوطني للتطوير المهني', link: 'https://niepd.futurex.sa/', icon: getFaviconUrl('https://niepd.futurex.sa/') }
    ]
  },
  {
    category: 'ادوات مساعدة',
    icon: 'i-lucide-wrench',
    child: [
      { label: 'تحميل من اليوتيوب', link: 'https://y2mate.gs/', icon: getFaviconUrl('https://y2mate.gs/') },
      { label: 'تحويل صيغ الملفات من الجهاز', link: 'https://cloudconvert.com', icon: getFaviconUrl('https://cloudconvert.com') }
    ]
  },
  {
    category: 'التواصل الإجتماعي',
    icon: 'i-lucide-share-2',
    child: [
      { label: 'إكس (تويتر)', link: 'https://x.com', icon: getFaviconUrl('https://x.com') },
      { label: 'فيسبوك', link: 'https://facebook.com', icon: getFaviconUrl('https://facebook.com') },
      { label: 'واتساب ويب', link: 'https://web.whatsapp.com/', icon: 'i-simple-icons-whatsapp' },
      { label: 'تليقرام ويب', link: 'https://web.telegram.org/k/', icon: 'i-simple-icons-telegram' }
    ]
  },
  {
    category: 'خدمات Microsoft',
    icon: 'i-simple-icons-microsoft',
    child: [
      { label: 'مايكروسوفت 365', link: 'https://www.microsoft365.com', icon: getFaviconUrl('https://www.microsoft365.com') },
      { label: 'ون درايف', link: 'https://onedrive.live.com', icon: getFaviconUrl('https://onedrive.live.com') },
      { label: 'تيمز', link: 'https://teams.microsoft.com', icon: getFaviconUrl('https://teams.microsoft.com') },
      { label: 'أوتلوك', link: 'https://outlook.live.com', icon: getFaviconUrl('https://outlook.live.com') }
    ]
  },
  {
    category: 'خدمات Google',
    icon: 'i-simple-icons-google',
    child: [
      { label: 'بحث جوجل', link: 'https://www.google.com', icon: getFaviconUrl('https://www.google.com') },
      { label: 'جوجل درايف', link: 'https://drive.google.com', icon: 'i-simple-icons-googledrive' },
      { label: 'نماذج جوجل', link: 'https://forms.google.com', icon: 'i-simple-icons-googleforms' },
      { label: 'جداول جوجل', link: 'https://sheets.google.com', icon: 'i-simple-icons-googlesheets' },
      { label: 'شرائح جوجل', link: 'https://docs.google.com/presentation', icon: 'i-simple-icons-googleslides' },
      { label: 'مستندات جوجل', link: 'https://docs.google.com', icon: 'i-simple-icons-googledocs' },
      { label: 'يوتيوب', link: 'https://www.youtube.com', icon: getFaviconUrl('https://www.youtube.com') },
      { label: 'جيميل', link: 'https://mail.google.com', icon: 'i-simple-icons-gmail' }
    ]
  },
  {
    category: 'وزارة التعليم',
    icon: 'i-lucide-graduation-cap',
    child: [
      { label: 'موقع وزارة التعليم', link: 'https://www.moe.gov.sa', icon: getFaviconUrl('https://www.moe.gov.sa') },
      { label: 'نظام نور', link: 'https://noor.moe.gov.sa', icon: getFaviconUrl('https://noor.moe.gov.sa') },
      { label: 'نظام فارس', link: 'https://sshr.moe.gov.sa', icon: getFaviconUrl('https://sshr.moe.gov.sa') },
      { label: 'منصة مدرستي', link: 'https://schools.madrasati.sa', icon: getFaviconUrl('https://schools.madrasati.sa') },
      { label: 'بوابة الدعم الموحد', link: 'https://usc.moe.gov.sa/moe_csm', icon: getFaviconUrl('https://usc.moe.gov.sa/moe_csm') },
      { label: 'البريد الوزاري', link: 'https://webmail.moe.gov.sa', icon: getFaviconUrl('https://webmail.moe.gov.sa') },
      { label: 'حضوري', link: 'https://hather-ui.moe.gov.sa/', icon: 'i-lucide-fingerprint-pattern' }
    ]
  }
]

const bookmarks = ref<BookmarkCategory[]>(defaultBookmarks)

onMounted(() => {
  const savedCategories = localStorage.getItem('custom_categories')
  if (savedCategories) {
    try {
      const parsedCats: BookmarkCategory[] = JSON.parse(savedCategories)
      parsedCats.forEach((customCat) => {
        if (!bookmarks.value.some(b => b.category === customCat.category)) {
          bookmarks.value.push(customCat)
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  const savedBookmarks = localStorage.getItem('custom_bookmarks')
  if (savedBookmarks) {
    try {
      const customItems: (BookmarkItem & { category: string })[] = JSON.parse(savedBookmarks)
      customItems.forEach((item) => {
        const cat = bookmarks.value.find(b => b.category === item.category)
        if (cat && !cat.child.some(c => c.link === item.link)) {
          cat.child.push(item)
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  const firstBookmark = bookmarks.value[0]
  if (firstBookmark && !newBookmark.category) {
    newBookmark.category = firstBookmark.category
  }
})

const saveCustomCategories = () => {
  const customCats = bookmarks.value.filter(b => b.isCustom)
  localStorage.setItem('custom_categories', JSON.stringify(customCats))
}

const saveCustomBookmarks = () => {
  const customItems: (BookmarkItem & { category: string })[] = []
  bookmarks.value.forEach((group) => {
    group.child.forEach((item) => {
      if (item.isCustom) {
        customItems.push({ ...item, category: group.category })
      }
    })
  })
  localStorage.setItem('custom_bookmarks', JSON.stringify(customItems))
}

const handleAddCategory = () => {
  if (!newCategory.name.trim()) {
    toast.add({ title: 'تنبيه', description: 'الرجاء إدخال اسم الفئة.', color: 'warning' })
    return
  }

  if (bookmarks.value.some(b => b.category.toLowerCase() === newCategory.name.trim().toLowerCase())) {
    toast.add({ title: 'تنبيه', description: 'هذه الفئة موجودة مسبقاً.', color: 'warning' })
    return
  }

  bookmarks.value.push({
    category: newCategory.name.trim(),
    icon: newCategory.icon || 'i-lucide-folder',
    isCustom: true,
    child: []
  })

  saveCustomCategories()
  toast.add({ title: 'نجاح', description: 'تم إنشاء الفئة بنجاح.', color: 'success' })

  newCategory.name = ''
  newCategory.icon = 'i-lucide-folder'
  categoryModal.value = false
}

const deleteCategory = (categoryName: string) => {
  const group = bookmarks.value.find(b => b.category === categoryName)
  if (group && group.child.length > 0) {
    toast.add({ title: 'تنبيه', description: 'لا يمكن حذف فئة تحتوي على روابط، قم بحذف الروابط أولاً.', color: 'warning' })
    return
  }

  bookmarks.value = bookmarks.value.filter(b => b.category !== categoryName)
  saveCustomCategories()
  toast.add({ title: 'حذف', description: 'تم إزالة الفئة بنجاح.', color: 'error' })
}

const handleAddBookmark = () => {
  if (!newBookmark.label || !newBookmark.link) {
    toast.add({ title: 'تنبيه', description: 'الرجاء إدخال الاسم والرابط بشكل صحيح.', color: 'warning' })
    return
  }

  let formattedLink = newBookmark.link
  if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
    formattedLink = 'https://' + formattedLink
  }

  const targetCategory = bookmarks.value.find(b => b.category === newBookmark.category)
  if (targetCategory) {
    targetCategory.child.push({
      id: Date.now().toString(),
      label: newBookmark.label,
      link: formattedLink,
      icon: getFaviconUrl(formattedLink),
      isCustom: true
    })
    saveCustomBookmarks()
    toast.add({ title: 'نجاح', description: 'تم إضافة الرابط بنجاح.', color: 'success' })

    newBookmark.label = ''
    newBookmark.link = ''
    addModal.value = false
  }
}

const deleteBookmark = (categoryName: string, id?: string) => {
  const group = bookmarks.value.find(b => b.category === categoryName)
  if (group) {
    group.child = group.child.filter(item => item.id !== id)
    saveCustomBookmarks()
    toast.add({ title: 'حذف', description: 'تم إزالة الرابط بنجاح.', color: 'error' })
  }
}

const availableCategories = computed(() => bookmarks.value.map(b => b.category))

// هنا تم إضافة reverse() لكي يبدأ العرض بالترتيب العكسي من أقصى اليمين
const filteredBookmarks = computed(() => {
  let result = bookmarks.value
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = bookmarks.value.map(group => ({
      ...group,
      child: group.child.filter(item => item.label.toLowerCase().includes(query))
    })).filter(group => group.child.length > 0)
  }
  return [...result].reverse()
})
</script>

<template>
  <div
    class="h-full flex flex-col gap-4 w-full"
    dir="rtl"
  >
    <!-- رأس الصفحة وأدوات البحث -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <div class="relative w-full sm:w-72">
        <UInput
          v-model="searchQuery"
          placeholder="ابحث في الروابط المفضلة..."
          icon="i-lucide-search"
          class="w-full"
          clearable
        />
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <UButton
          label="إضافة فئة"
          icon="i-lucide-folder-plus"
          size="sm"
          color="neutral"
          variant="subtle"
          @click="categoryModal = true"
        />
        <UButton
          label="إضافة رابط مفضل"
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          variant="solid"
          @click="addModal = true"
        />
      </div>
    </div>

    <!-- شبكة الجالاري المتدرجة -->
    <div
      v-if="filteredBookmarks.length > 0"
      class="columns-1 md:columns-2 xl:columns-4 gap-4 w-full"
      dir="rtl"
      style="direction: rtl;"
    >
      <div
        v-for="(group, index) in filteredBookmarks"
        :key="index"
        class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-default/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300 group/cat break-inside-avoid w-full mb-4"
      >
        <div class="flex items-center gap-2 pb-2.5 border-b border-dashed border-default">
          <div class="p-1.5 rounded-xl flex w-6 h-6 items-center justify-center bg-primary/10 text-primary">
            <UIcon
              :name="group.icon"
              class="w-4 h-4"
            />
          </div>
          <h3 class="font-bold text-sm text-foreground truncate">
            {{ group.category }}
          </h3>
          <span class="ms-auto text-[10px] bg-muted/20 px-2 py-0.5 rounded-full text-muted font-medium">
            {{ group.child.length }}
          </span>
          <UButton
            v-if="group.isCustom && group.child.length === 0"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            class="opacity-100 xl:opacity-0 xl:group-hover/cat:opacity-100 transition-opacity shrink-0"
            @click="deleteCategory(group.category)"
          />
        </div>

        <div class="flex flex-col gap-1.5 overflow-y-auto max-h-100 ps-1">
          <div
            v-for="(item, itemIndex) in group.child"
            :key="itemIndex"
            class="group relative flex items-center justify-between p-2.5 rounded-xl bg-muted/5 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200"
          >
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 truncate flex-1"
            >
              <img
                v-if="item.icon && item.icon.startsWith('http')"
                :src="item.icon"
                alt="favicon"
                width="16"
                height="16"
                class="w-4 h-4 shrink-0 rounded-sm object-contain"
                @error="(e: Event) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-globe')) {
                    const fallback = target.ownerDocument.createElement('span');
                    fallback.className = 'fallback-globe i-lucide-globe w-4 h-4 shrink-0 text-muted';
                    parent.prepend(fallback);
                  }
                }"
              >
              <UIcon
                v-else-if="item.icon"
                :name="item.icon"
                class="w-4 h-4 shrink-0 text-muted group-hover:text-primary transition-colors"
              />
              <span class="text-sm font-medium text-muted-foreground group-hover:text-primary truncate transition-colors">
                {{ item.label }}
              </span>
            </a>

            <UButton
              v-if="item.isCustom"
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              class="opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity absolute inset-s-auto inset-e-2"
              @click="deleteBookmark(group.category, item.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- حالة عدم وجود نتائج -->
    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-default rounded-2xl bg-muted/5 text-center gap-2"
    >
      <UIcon
        name="i-lucide-search-x"
        class="w-10 h-10 text-muted opacity-50"
      />
      <span class="font-semibold text-sm">لا توجد نتائج مطابقة لـ "{{ searchQuery }}"</span>
    </div>

    <!-- نافذة إضافة فئة جديدة -->
    <UModal
      v-model:open="categoryModal"
      title="إنشاء فئة جديدة"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="اسم الفئة">
            <UInput
              v-model="newCategory.name"
              placeholder="مثال: أدوات التطوير"
              class="w-full"
            />
          </UFormField>

          <div class="space-y-2">
            <label class="text-xs font-semibold text-muted">اختر أيقونة الفئة:</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="(iconObj, i) in presetIcons"
                :key="i"
                type="button"
                class="flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1"
                :class="newCategory.icon === iconObj.name ? 'border-primary bg-primary/10 text-primary' : 'border-default bg-muted/5 hover:bg-muted/10 text-muted'"
                @click="newCategory.icon = iconObj.name"
              >
                <UIcon
                  :name="iconObj.name"
                  class="w-5 h-5"
                />
                <span class="text-[10px] truncate">{{ iconObj.label }}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              color="neutral"
              variant="subtle"
              label="إلغاء"
              @click="categoryModal = false"
            />
            <UButton
              color="primary"
              label="إنشاء الفئة"
              @click="handleAddCategory"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- نافذة إضافة رابط مفضل -->
    <UModal
      v-model:open="addModal"
      title="إنشاء رابط مفضل جديد"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="اختر الفئة">
            <USelect
              v-model="newBookmark.category"
              :items="availableCategories"
              class="w-full"
            />
          </UFormField>

          <UFormField label="اسم الموقع أو الخدمة">
            <UInput
              v-model="newBookmark.label"
              placeholder="مثال: GitHub"
              class="w-full"
            />
          </UFormField>

          <UFormField label="رابط الموقع (URL)">
            <UInput
              v-model="newBookmark.link"
              placeholder="https://github.com"
              class="w-full"
              dir="ltr"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              color="neutral"
              variant="subtle"
              label="إلغاء"
              @click="addModal = false"
            />
            <UButton
              color="primary"
              label="حفظ وإضافة"
              @click="handleAddBookmark"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

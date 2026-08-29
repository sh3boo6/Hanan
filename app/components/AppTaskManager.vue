<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { z } from 'zod'

// تعريف مخطط التحقق (Zod Schema) للبيانات
const taskSchema = z.object({
  title: z.string().min(3, { message: 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل' }),
  description: z.string().optional(),
  category: z.enum(['إداري', 'تعليمي', 'أنشطة طلابية', 'صيانة', 'اخرى']),
  priority: z.enum(['عالي', 'متوسط', 'منخفض'])
})

interface Task {
  id: string
  title: string
  description: string
  category: 'إداري' | 'تعليمي' | 'أنشطة طلابية' | 'صيانة' | 'اخرى'
  priority: 'عالي' | 'متوسط' | 'منخفض'
  status: 'pending' | 'completed'
  createdAt: string
  closedAt: string | null
  durationMs: number | null
}

const STORAGE_KEY = 'school_tasks_manager_v4'

const tasks = ref<Task[]>([])
const isOpenCreateModal = ref(false)
const filterStatus = ref<'all' | 'pending' | 'completed'>('all')
const searchQuery = ref('')
const errorMessage = ref<string | null>(null)

// حالات نافذة تأكيد الحذف
const isOpenDeleteModal = ref(false)
const taskToDeleteId = ref<string | null>(null)

const form = ref({
  title: '',
  description: '',
  category: 'إداري' as Task['category'],
  priority: 'متوسط' as Task['priority']
})

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      tasks.value = JSON.parse(saved)
    } catch (e) {
      console.error('خطأ في استرجاع المهام', e)
    }
  }
})

const saveToLocalStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
}

const createTask = () => {
  errorMessage.value = null

  // التحقق باستخدام Zod
  const result = taskSchema.safeParse(form.value)
  if (!result.success) {
    errorMessage.value = result.error.issues[0]?.message || 'خطأ في التحقق من البيانات'
    return
  }

  const newTask: Task = {
    id: Date.now().toString(),
    title: form.value.title,
    description: form.value.description,
    category: form.value.category,
    priority: form.value.priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    closedAt: null,
    durationMs: null
  }

  tasks.value.unshift(newTask)
  saveToLocalStorage()

  form.value.title = ''
  form.value.description = ''
  isOpenCreateModal.value = false
}

const toggleTaskStatus = (task: Task) => {
  if (task.status === 'pending') {
    task.status = 'completed'
    task.closedAt = new Date().toISOString()
    task.durationMs = new Date(task.closedAt).getTime() - new Date(task.createdAt).getTime()
  } else {
    task.status = 'pending'
    task.closedAt = null
    task.durationMs = null
  }
  saveToLocalStorage()
}

// فتح نافذة تأكيد الحذف
const confirmDelete = (id: string) => {
  taskToDeleteId.value = id
  isOpenDeleteModal.value = true
}

// تنفيذ الحذف بعد التأكيد
const executeDelete = () => {
  if (taskToDeleteId.value) {
    tasks.value = tasks.value.filter(t => t.id !== taskToDeleteId.value)
    saveToLocalStorage()
    isOpenDeleteModal.value = false
    taskToDeleteId.value = null
  }
}

const formatDate = (isoString: string | null) => {
  if (!isoString) return '-'
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(isoString))
}

const formatDuration = (ms: number | null) => {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} يوم و ${hours % 24} ساعة`
  if (hours > 0) return `${hours} ساعة و ${minutes % 60} دقيقة`
  if (minutes > 0) return `${minutes} دقيقة`
  return 'أقل من دقيقة'
}

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesStatus = filterStatus.value === 'all' || task.status === filterStatus.value
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  pending: tasks.value.filter(t => t.status === 'pending').length
}))
</script>

<template>
  <div
    class="p-6 max-w-7xl mx-auto space-y-6"
    dir="rtl"
  >
    <!-- رأس لوحة التحكم -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <span>🏫</span> نظام إدارة المهام المدرسية
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          متابعة مهام المعلمين والإداريين بدقة واستخراج أوقات الإنجاز الفورية
        </p>
      </div>

      <UButton
        icon="i-heroicons-plus-circle"
        size="lg"
        color="primary"
        @click="isOpenCreateModal = true"
      >
        إضافة مهمة جديدة
      </UButton>
    </div>

    <!-- بطاقات الإحصائيات -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard class="border-l-4 border-l-primary-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 font-medium">
              إجمالي المهام
            </p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {{ stats.total }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-clipboard-document-list"
            class="w-8 h-8 text-primary-500"
          />
        </div>
      </UCard>

      <UCard class="border-l-4 border-l-amber-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 font-medium">
              قيد التنفيذ
            </p>
            <p class="text-3xl font-bold text-amber-600 mt-1">
              {{ stats.pending }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-clock"
            class="w-8 h-8 text-amber-500"
          />
        </div>
      </UCard>

      <UCard class="border-l-4 border-l-emerald-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 font-medium">
              المكتملة
            </p>
            <p class="text-3xl font-bold text-emerald-600 mt-1">
              {{ stats.completed }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-check-circle"
            class="w-8 h-8 text-emerald-500"
          />
        </div>
      </UCard>
    </div>

    <!-- أدوات البحث والفلترة -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="ابحث في المهام..."
        class="w-full sm:w-80 block"
      />

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <UButton
          :color="filterStatus === 'all' ? 'primary' : 'neutral'"
          variant="soft"
          @click="filterStatus = 'all'"
        >
          الكل
        </UButton>
        <UButton
          :color="filterStatus === 'pending' ? 'primary' : 'neutral'"
          variant="soft"
          @click="filterStatus = 'pending'"
        >
          قيد التنفيذ
        </UButton>
        <UButton
          :color="filterStatus === 'completed' ? 'primary' : 'neutral'"
          variant="soft"
          @click="filterStatus = 'completed'"
        >
          المكتملة
        </UButton>
      </div>
    </div>

    <!-- قائمة المهام -->
    <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden">
      <div
        v-if="filteredTasks.length === 0"
        class="p-12 text-center text-neutral-400"
      >
        <UIcon
          name="i-heroicons-inbox"
          class="w-12 h-12 mx-auto mb-3 opacity-40"
        />
        <p>لا توجد مهام مطابقة للبحث</p>
      </div>

      <div
        v-else
        class="divide-y divide-neutral-100 dark:divide-neutral-800"
      >
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition"
        >
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge
                :color="task.priority === 'عالي' ? 'error' : task.priority === 'متوسط' ? 'primary' : 'secondary'"
                variant="subtle"
              >
                {{ task.priority }}
              </UBadge>

              <UBadge
                color="secondary"
                variant="outline"
              >
                {{ task.category }}
              </UBadge>

              <h3 :class="['text-base font-semibold', task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white']">
                {{ task.title }}
              </h3>
            </div>

            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ task.description || 'بدون تفاصيل إضافية' }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-heroicons-plus-circle"
                  class="w-4 h-4 text-primary-500"
                />
                الإضافة: {{ formatDate(task.createdAt) }}
              </span>

              <span
                v-if="task.closedAt"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-4 h-4 text-emerald-500"
                />
                الإغلاق: {{ formatDate(task.closedAt) }}
              </span>

              <span
                v-if="task.durationMs"
                class="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded"
              >
                <UIcon
                  name="i-heroicons-bolt"
                  class="w-4 h-4"
                />
                مدة الإنجاز: {{ formatDuration(task.durationMs) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center">
            <UButton
              :color="task.status === 'completed' ? 'secondary' : 'success'"
              variant="soft"
              size="sm"
              :icon="task.status === 'completed' ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
              @click="toggleTaskStatus(task)"
            >
              {{ task.status === 'completed' ? 'إعادة فتح' : 'إنجاز' }}
            </UButton>

            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-heroicons-trash"
              @click="confirmDelete(task.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة إضافة مهمة (Modal) مع Zod Validation -->
    <UModal
      v-model:open="isOpenCreateModal"
      title="إضافة مهمة مدرسية جديدة"
    >
      <template #body>
        <div
          class="space-y-3"
          dir="rtl"
        >
          <!-- عرض خطأ التحقق Zod إن وجد -->
          <div
            v-if="errorMessage"
            class="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900"
          >
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">عنوان المهمة</label>
            <UInput
              v-model="form.title"
              class="block w-full"
              placeholder="مثال: رصد درجات اختبار الرياضيات..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">التصنيف</label>
            <USelect
              v-model="form.category"
              :items="['إداري', 'تعليمي', 'أنشطة طلابية', 'صيانة', 'اخرى']"
              class="block w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">الأولوية</label>
            <USelect
              v-model="form.priority"
              :items="['عالي', 'متوسط', 'منخفض']"
              class="block w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">التفاصيل / الملاحظات</label>
            <UTextarea
              v-model="form.description"
              placeholder="اكتب تفاصيل إضافية للمهمة..."
              class="block w-full"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="isOpenCreateModal = false"
          >
            إلغاء
          </UButton>
          <UButton
            color="primary"
            @click="createTask"
          >
            حفظ المهمة
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- نافذة تأكيد الحذف (Confirmation Modal) -->
    <UModal
      v-model:open="isOpenDeleteModal"
      title="تأكيد الحذف"
    >
      <template #body>
        <p class="text-neutral-600 dark:text-neutral-300">
          هل أنت متأكد من رغبتك في حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="isOpenDeleteModal = false"
          >
            تراجع
          </UButton>
          <UButton
            color="error"
            @click="executeDelete"
          >
            تأكيد الحذف
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface SymbolItem {
  char: string
  name: string
}

interface SymbolGroup {
  id: string
  title: string
  icon: string
  items: SymbolItem[]
}

const toast = useToast()
const searchQuery = ref('')

const copied = ref<string | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const groups: SymbolGroup[] = [
  {
    id: 'apple',
    title: 'اختصارات ماك',
    icon: 'i-lucide-command',
    items: [
      { char: '⌘', name: 'Command' },
      { char: '⌥', name: 'Option' },
      { char: '⌃', name: 'Control' },
      { char: '⇧', name: 'Shift' },
      { char: '⌫', name: 'Delete' },
      { char: '⎋', name: 'Escape' },
      { char: '↩', name: 'Return' },
      { char: '⇥', name: 'Tab' },
      { char: '␣', name: 'Space' },
      { char: '⌘', name: 'Command' },
      { char: '⌥', name: 'Option' },
      { char: '⌃', name: 'Control' },
      { char: '⇧', name: 'Shift' }
    ]
  },
  {
    id: 'checkbox',
    title: 'مربعات اختيار',
    icon: 'i-lucide-square-check-big',
    items: [
      { char: '☑', name: 'مربع تحديد ممتلئ' },
      { char: '☐', name: 'مربع تحديد فارغ' },
      { char: '☒', name: 'مربع تحديد بعلامة X' }
    ]
  },
  {
    id: 'marks',
    title: 'علامات وصح',
    icon: 'i-lucide-check',
    items: [
      { char: '✓', name: 'صح' },
      { char: '✔', name: 'صح عريض' },
      { char: '✗', name: 'خطأ' },
      { char: '✘', name: 'خطأ عريض' },
      { char: '✚', name: 'زائد' },
      { char: '✖', name: 'ضرب' },
      { char: '❗', name: 'تعجب' },
      { char: '❓', name: 'سؤال' },
      { char: '⚠', name: 'تحذير' },
      { char: '♻', name: 'إعادة تدوير' },
      { char: '⚑', name: 'علم' },
      { char: '✎', name: 'قلم' }
    ]
  },
  {
    id: 'stars',
    title: 'نجوم وأشكال',
    icon: 'i-lucide-star',
    items: [
      { char: '★', name: 'نجمة ممتلئة' },
      { char: '☆', name: 'نجمة فارغة' },
      { char: '✪', name: 'نجمة دائرية' },
      { char: '✦', name: 'نجمة رباعية' },
      { char: '✧', name: 'نجمة فارغة رباعية' },
      { char: '✷', name: 'نجمة ثمانية' },
      { char: '✹', name: 'نجمة اثنتي عشرة' },
      { char: '❖', name: 'نجمة رباعية مع Maltese' },
      { char: '◈', name: 'مربع بقلب' },
      { char: '◇', name: 'مخطط فارغ' },
      { char: '◆', name: 'معيّن ممتلئ' },
      { char: '◊', name: 'معيّن فارغ' },
      { char: '◉', name: 'قرص مملوء' },
      { char: '◎', name: 'قرص مزدوج' },
      { char: '○', name: 'دائرة فارغة' },
      { char: '●', name: 'دائرة ممتلئة' },
      { char: '◐', name: 'دائرة نصف ممتلئة' },
      { char: '◍', name: 'دائرة مخططاة' },
      { char: '■', name: 'مربع ممتلئ' },
      { char: '□', name: 'مربع فارغ' },
      { char: '▲', name: 'مثلث أعلى' },
      { char: '▼', name: 'مثلث أسفل' },
      { char: '▶', name: 'مثلث يمين' },
      { char: '◀', name: 'مثلث يسار' }
    ]
  },
  {
    id: 'arrows',
    title: 'أسهم واتجاهات',
    icon: 'i-lucide-arrow-right',
    items: [
      { char: '←', name: 'سهم يسار' },
      { char: '→', name: 'سهم يمين' },
      { char: '↑', name: 'سهم أعلى' },
      { char: '↓', name: 'سهم أسفل' },
      { char: '↔', name: 'سهم أفقي' },
      { char: '↕', name: 'سهم رأسي' },
      { char: '⇄', name: 'سهمان متقاطعان' },
      { char: '⇆', name: 'سهمان متعاكسان' },
      { char: '⟶', name: 'سهم طويل' },
      { char: '➜', name: 'سهم زائد' },
      { char: '➔', name: 'سهم مُدبب' },
      { char: '⇒', name: 'سهم مزدوج' },
      { char: '↪', name: 'دخول الزاوية' },
      { char: '↩', name: 'رجوع مع فلاش' }
    ]
  },
  {
    id: 'punctuation',
    title: 'علامات ترقيم',
    icon: 'i-lucide-quote',
    items: [
      { char: '…', name: 'نقاط أفقية' },
      { char: '•', name: 'نقطة كبيرة' },
      { char: '‣', name: 'نقطة مثلثة' },
      { char: '·', name: 'نقطة وسط' },
      { char: '•', name: 'نقطة' },
      { char: '◦', name: 'نقطة دائرية فارغة' },
      { char: '§', name: 'قسم' },
      { char: '¶', name: 'فقرة' },
      { char: '†', name: 'سك dagger' },
      { char: '‡', name: 'سك مزدوج' },
      { char: '№', name: 'رقم' },
      { char: '※', name: 'مرجع' },
      { char: '〜', name: 'موجة' },
      { char: '¿', name: 'استفهام معكوس' },
      { char: '¡', name: 'تعجب معكوس' }
    ]
  },
  {
    id: 'legal',
    title: 'رموز قانونية',
    icon: 'i-lucide-scale',
    items: [
      { char: '©', name: 'حقوق النشر' },
      { char: '®', name: 'مسجل' },
      { char: '™', name: 'علامة تجارية' },
      { char: '℗', name: 'النشر الصوتي' },
      { char: '℮', name: 'رمز التقدير' },
      { char: '⁽', name: 'قوس علوي' },
      { char: '⁾', name: 'قوس سفلي' }
    ]
  },
  {
    id: 'currency',
    title: 'عملات',
    icon: 'i-lucide-coins',
    items: [
      { char: '﷼', name: 'ريال سعودي' },
      { char: '₽', name: 'روبل روسي' },
      { char: '$', name: 'دولار' },
      { char: '€', name: 'يورو' },
      { char: '£', name: 'جنيه إسترليني' },
      { char: '¥', name: 'ين' },
      { char: '₩', name: 'وون' },
      { char: '₪', name: 'شيكل' },
      { char: '₺', name: 'ليرةتركية' },
      { char: '₫', name: 'دون' },
      { char: '₹', name: 'روبية' },
      { char: '₴', name: 'هريفنيا' },
      { char: '¢', name: 'سنت' },
      { char: '¤', name: 'رمز العملة' }
    ]
  },
  {
    id: 'math',
    title: 'رياضيات',
    icon: 'i-lucide-sigma',
    items: [
      { char: '≈', name: 'يساوي تقريباً' },
      { char: '≠', name: 'لا يساوي' },
      { char: '≤', name: 'أقل أو يساوي' },
      { char: '≥', name: 'أكبر أو يساوي' },
      { char: '±', name: 'زائد ناقص' },
      { char: '×', name: 'ضرب' },
      { char: '÷', name: 'قسمة' },
      { char: '∞', name: 'لا نهاية' },
      { char: '√', name: 'جذر' },
      { char: '∑', name: 'مجموع' },
      { char: '∏', name: 'حاصل ضرب' },
      { char: '∫', name: 'تكامل' },
      { char: '∂', name: 'مشتقة جزئية' },
      { char: '∆', name: 'دلتا' },
      { char: 'π', name: 'باي' },
      { char: 'µ', name: 'ميكرو' },
      { char: '°', name: 'درجة' },
      { char: '′', name: 'دقيقة' },
      { char: '″', name: 'ثانية' },
      { char: '∠', name: 'زاوية' },
      { char: '∥', name: 'متوازٍ' },
      { char: '∴', name: 'إذن' },
      { char: '≡', name: 'متطابق' }
    ]
  },
  {
    id: 'fractions',
    title: 'كسر و نسب',
    icon: 'i-lucide-percent',
    items: [
      { char: '½', name: 'نصف' },
      { char: '⅓', name: 'ثلث' },
      { char: '⅔', name: 'ثلثان' },
      { char: '¼', name: 'ربع' },
      { char: '¾', name: 'ثلاثة أرباع' },
      { char: '⅕', name: 'خُمس' },
      { char: '⅙', name: 'سُدس' },
      { char: '⅛', name: 'ثُمّن' },
      { char: '⅜', name: 'ثلاثة أثمان' },
      { char: '⅝', name: 'خمسة أثمان' },
      { char: '⅞', name: 'سبعة أثمان' },
      { char: '⅑', name: 'تسع' },
      { char: '⅒', name: 'عشر' },
      { char: '٪', name: 'نسبة مئوية' },
      { char: '%', name: 'نسبة' },
      { char: '‰', name: 'ألف' }
    ]
  },
  {
    id: 'lines',
    title: 'خطوط و فواصل',
    icon: 'i-lucide-minus',
    items: [
      { char: '─', name: 'خط أفقي' },
      { char: '━', name: 'خط عريض' },
      { char: '│', name: 'خط رأسي' },
      { char: '┌', name: 'زاوية عليا يمين' },
      { char: '┐', name: 'زاوية عليا يسار' },
      { char: '└', name: 'زاوية سفلية يمين' },
      { char: '┘', name: 'زاوية سفلية يسار' },
      { char: '╔', name: 'إطار مزدوج' },
      { char: '╚', name: 'إطار مزدوج سفلي' },
      { char: '╱', name: 'مائل يمين' },
      { char: '╲', name: 'مائل يسار' },
      { char: '╳', name: 'أقاطع' },
      { char: '⋯', name: 'نقاط أفقية' },
      { char: '≡', name: 'متطابق' },
      { char: '‾', name: 'شرطة علوية' },
      { char: '⁓', name: 'شرطة متوسطة' }
    ]
  },
  {
    id: 'misc',
    title: 'رموز متنوعة',
    icon: 'i-lucide-shapes',
    items: [
      { char: '♠', name: 'سبيكة' },
      { char: '♥', name: 'قلب' },
      { char: '♦', name: 'ماسي' },
      { char: '♣', name: 'ورقة' },
      { char: '☀', name: 'شمس' },
      { char: '☁', name: 'سحابة' },
      { char: '☂', name: 'مظلة' },
      { char: '⚕', name: 'صيدلة' },
      { char: '♫', name: 'نوتة موسيقية' },
      { char: '♪', name: 'نوتة واحدة' },
      { char: '♬', name: 'نوتتان' },
      { char: '☰', name: 'ثلاثة أسطر' },
      { char: '✆', name: 'هاتف' },
      { char: '✉', name: 'مظروف' },
      { char: '⌚', name: 'ساعة' },
      { char: '⏰', name: 'منبه' },
      { char: '⚙', name: 'ترس' },
      { char: '☂', name: 'مظلة' },
      { char: '♻', name: 'تدوير' },
      { char: '⚛', name: 'ذرة' },
      { char: '☢', name: 'إشعاع' }
    ]
  }
]

const copySymbol = async (item: SymbolItem) => {
  try {
    await navigator.clipboard.writeText(item.char)
    copied.value = item.char
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = null
    }, 1200)
  } catch (err) {
    console.error(err)
    toast.add({ title: 'تعذر النسخ', description: 'لم يتم نسخ الرمز، حاول مرة أخرى.', color: 'error' })
  }
}

const copyGroup = async (group: SymbolGroup) => {
  try {
    await navigator.clipboard.writeText(group.items.map(i => i.char).join(''))
    toast.add({ title: 'نسخ', description: `تم نسخ رموز "${group.title}" إلى الحافظة.`, color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'تعذر النسخ', description: 'لم يتم نسخ الرموز، حاول مرة أخرى.', color: 'error' })
  }
}

const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return groups

  return groups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.name.toLowerCase().includes(query) || item.char.toLowerCase().includes(query))
    }))
    .filter(group => group.items.length > 0)
})

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <div
    class="h-full flex flex-col gap-4 w-full"
    dir="rtl"
  >
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <div class="relative w-full sm:w-72">
        <UInput
          v-model="searchQuery"
          placeholder="ابحث عن رمز أو اسم..."
          icon="i-lucide-search"
          class="w-full"
          clearable
        />
      </div>
      <p class="text-xs text-muted">
        اضغط على أي رمز لنسخه إلى الحافظة
      </p>
    </div>

    <div
      v-if="filteredGroups.length > 0"
      class="flex flex-col gap-4 w-full"
    >
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-default/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
      >
        <div class="flex items-center gap-2 pb-2.5 border-b border-dashed border-default">
          <div class="p-1.5 rounded-xl flex w-6 h-6 items-center justify-center bg-primary/10 text-primary">
            <UIcon
              :name="group.icon"
              class="w-4 h-4"
            />
          </div>
          <h3 class="font-bold text-sm text-foreground truncate">
            {{ group.title }}
          </h3>
          <span class="ms-auto text-[10px] bg-muted/20 px-2 py-0.5 rounded-full text-muted font-medium">
            {{ group.items.length }}
          </span>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-copy"
            label="نسخ الكل"
            class="shrink-0"
            @click="copyGroup(group)"
          />
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
          <button
            v-for="item in group.items"
            :key="`${group.id}-${item.char}-${item.name}`"
            type="button"
            class="group relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-transparent bg-muted/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            :title="item.name"
            @click="copySymbol(item)"
          >
            <span class="text-2xl leading-none text-foreground group-hover:text-primary transition-colors">{{ item.char }}</span>
            <span class="text-[10px] truncate w-full text-center text-muted">{{ item.name }}</span>
            <UIcon
              v-if="copied === item.char"
              name="i-lucide-check"
              class="absolute top-1 end-1 w-3.5 h-3.5 text-success"
            />
          </button>
        </div>
      </div>
    </div>

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
  </div>
</template>

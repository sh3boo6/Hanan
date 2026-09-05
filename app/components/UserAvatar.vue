<template>
  <div class="flex items-center gap-3">
    <UDropdownMenu
      v-if="loggedIn && user"
      :items="menuItems"
      :content="{ align: 'end', side: 'bottom' }"
    >
      <button class="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
        <UAvatar
          :src="(user as GoogleUser).picture"
          :alt="(user as GoogleUser).name"
          size="md"
          class="ring-2 ring-primary-500/20"
        />
        <div class="hidden sm:block text-right">
          <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {{ (user as GoogleUser).name }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">
            {{ (user as GoogleUser).email }}
          </p>
        </div>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 text-gray-400 hidden sm:block mr-1"
        />
      </button>
    </UDropdownMenu>

    <template v-else>
      <UButton
        to="/api/auth/google"
        external
        color="primary"
        variant="ghost"
        icon="i-lucide-user"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserSession } from '#imports'

interface GoogleUser {
  name: string
  email: string
  picture: string
}

const { loggedIn, user, clear } = useUserSession()

const handleLogout = async () => {
  await clear()
  await navigateTo('/')
}

const menuItems = computed(() => [
  [
    {
      label: (user.value as GoogleUser | null)?.name || '',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'تسجيل الخروج',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: handleLogout
    }
  ]
])
</script>

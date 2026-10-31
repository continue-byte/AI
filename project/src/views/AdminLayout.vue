<script setup>
// 后台公共布局：左侧侧边栏 + 顶部用户信息 + 主内容区（router-view）
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.replace('/')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- 左侧侧边栏 -->
    <aside class="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
      <!-- 品牌 -->
      <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <span class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
          <Icon icon="mdi:leaf" class="text-white" width="18" height="18" />
        </span>
        <span class="text-base font-bold">小桔后台</span>
      </div>

      <!-- 菜单 -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <router-link
          v-for="item in [
            { to: '/admin/users', icon: 'mdi:account-group-outline', label: '用户管理' },
          ]"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors duration-150 hover:bg-sand hover:text-primary"
          active-class="bg-sand text-primary font-medium"
        >
          <Icon :icon="item.icon" width="20" height="20" />
          {{ item.label }}
        </router-link>
      </nav>

      <!-- 返回首页 -->
      <button
        @click="goHome"
        class="mx-3 mb-4 flex items-center justify-center gap-2 rounded-lg border border-gray-100 py-2 text-xs text-muted transition-colors hover:border-primary/30 hover:text-primary"
      >
        <Icon icon="mdi:web" width="16" height="16" />
        返回官网首页
      </button>
    </aside>

    <!-- 主内容区 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- 顶部导航条 -->
      <header class="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:px-6">
        <div class="flex items-center gap-2">
          <!-- 移动端返回菜单入口 -->
          <Icon icon="mdi:menu" width="20" height="20" class="text-muted md:hidden" />
          <h1 class="text-sm font-semibold md:text-base">{{ auth.currentUser?.name }} 你好</h1>
        </div>
        <div class="flex items-center gap-3">
          <!-- 角色标签 -->
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="auth.isAdmin ? 'bg-primary/15 text-primary' : 'bg-teal/15 text-teal'"
          >
            {{ auth.isAdmin ? '管理员' : '普通用户' }}
          </span>
          <!-- 退出按钮 -->
          <button
            @click="handleLogout"
            class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Icon icon="mdi:logout" width="16" height="16" />
            退出
          </button>
        </div>
      </header>

      <!-- 路由子页面 -->
      <main class="p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

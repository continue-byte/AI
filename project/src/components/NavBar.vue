<script setup>
// 顶部导航：Logo + 菜单 + CTA；滚动后切换毛玻璃态；移动端汉堡菜单带进出场动画；登录后显示后台入口
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { navLinks, product, hero } from "../data/mock.js";
import { useAuthStore } from "../stores/auth.js";

const auth = useAuthStore();
const router = useRouter();

// 移动端菜单开合状态
const menuOpen = ref(false);
// 是否已滚动（超过 8px 后启用毛玻璃背景与阴影）
const scrolled = ref(false);

function handleLogout() {
  auth.logout();
  router.replace("/");
}

function onScroll() {
  scrolled.value = window.scrollY > 8;
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="
      scrolled ? 'bg-white/85 shadow-sm backdrop-blur-md' : 'bg-transparent'
    "
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-2">
        <span
          class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-dark"
        >
          <Icon icon="mdi:leaf" class="text-white" width="20" height="20" />
        </span>
        <span class="text-lg font-bold">{{ product.name }}</span>
      </a>

      <!-- 桌面端菜单 -->
      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in navLinks" :key="link.href">
          <a
            :href="link.href"
            class="text-sm text-muted transition-colors duration-150 hover:text-primary"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <!-- 桌面端 CTA -->
      <div class="hidden md:flex md:items-center md:gap-2">
        <!-- 已登录显示后台入口，未登录显示登录 -->
        <template v-if="auth.isLoggedIn">
          <router-link
            to="/admin/users"
            class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-primary transition-colors hover:bg-sand"
          >
            <Icon icon="mdi:shield-account-outline" width="18" height="18" />
            管理后台
          </router-link>
          <button
            @click="handleLogout"
            class="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-primary"
          >
            退出
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-primary"
          >
            登录
          </router-link>
          <a
            href="#cta"
            class="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-dark"
          >
            {{ hero.primaryCta }}
          </a>
        </template>
      </div>

      <!-- 移动端：已登录显示后台入口 -->
      <div v-if="auth.isLoggedIn" class="hidden items-center gap-1 md:hidden">
        <router-link
          to="/admin/users"
          class="grid size-9 place-items-center rounded-md text-primary"
          title="管理后台"
        >
          <Icon icon="mdi:shield-account-outline" width="20" height="20" />
        </router-link>
      </div>

      <!-- 移动端汉堡按钮 -->
      <button
        type="button"
        class="grid size-10 place-items-center rounded-md text-ink md:hidden"
        :aria-expanded="menuOpen"
        aria-label="切换菜单"
        @click="menuOpen = !menuOpen"
      >
        <Icon
          :icon="menuOpen ? 'mdi:close' : 'mdi:menu'"
          width="24"
          height="24"
        />
      </button>
    </nav>

    <!-- 移动端下拉菜单：过渡进出场 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div v-if="menuOpen" class="border-t border-gray-100 bg-white md:hidden">
        <ul class="space-y-1 px-4 py-3">
          <li v-for="link in navLinks" :key="link.href">
            <a
              :href="link.href"
              class="block rounded-lg py-2.5 text-sm transition-colors duration-150 hover:bg-sand hover:text-primary"
              @click="menuOpen = false"
            >
              {{ link.label }}
            </a>
          </li>
          <li>
            <a
              href="#cta"
              class="mt-2 block rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-dark"
              @click="menuOpen = false"
            >
              {{ hero.primaryCta }}
            </a>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

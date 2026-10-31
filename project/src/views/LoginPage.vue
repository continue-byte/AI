<script setup>
// 登录页：简洁居中表单 + 表单校验 + Mock 登录 + 登录成功跳转
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "../stores/auth.js";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// 表单数据（清空默认值让用户自己输入）
const form = reactive({
  username: "",
  password: "",
});

// 表单校验错误
const errors = reactive({
  username: "",
  password: "",
});

function validate() {
  errors.username = form.username.trim() ? "" : "请输入账号";
  errors.password = form.password ? "" : "请输入密码";
  return !errors.username && !errors.password;
}

async function onSubmit(e) {
  e.preventDefault();
  if (!validate()) return;
  const ok = await auth.login({
    username: form.username.trim(),
    password: form.password,
  });
  if (ok) {
    const redirect = route.query.redirect || "/admin/users";
    router.replace(redirect);
  }
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-sand px-4 py-10"
  >
    <!-- 背景装饰（pointer-events-none 确保不拦截任何点击/输入） -->
    <div
      class="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-primary/10 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-teal/10 blur-3xl"
    />

    <div class="relative pointer-events-auto w-full max-w-md">
      <!-- 品牌 Logo + 返回链接 -->
      <div class="mb-8 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2">
          <span
            class="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-dark"
          >
            <Icon icon="mdi:leaf" class="text-white" width="22" height="22" />
          </span>
          <span class="text-lg font-bold">小桔协作</span>
        </router-link>
        <router-link
          to="/"
          class="flex items-center gap-1 text-sm text-muted hover:text-primary"
        >
          <Icon icon="mdi:arrow-left" width="16" height="16" />
          返回首页
        </router-link>
      </div>

      <!-- 登录卡片 -->
      <div
        class="pointer-events-auto rounded-2xl border border-white/80 bg-white/90 p-8 shadow-xl backdrop-blur"
      >
        <h1 class="text-2xl font-black">
          <span class="text-gradient">欢迎回来</span>
        </h1>
        <p class="mt-2 text-sm text-muted">
          登录进入管理后台，管理你的团队成员与角色。
        </p>

        <!-- novalidate 阻止浏览器原生校验干扰；@submit 双重拦截 -->
        <form
          class="pointer-events-auto mt-8 space-y-5"
          novalidate
          @submit="onSubmit"
        >
          <!-- 账号 -->
          <div class="pointer-events-auto">
            <label class="mb-1.5 block text-sm font-medium text-ink"
              >账号</label
            >
            <div
              class="flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 transition-colors duration-150"
              :class="
                errors.username
                  ? 'border-red-400'
                  : 'border-gray-200 focus-within:border-primary'
              "
            >
              <Icon
                icon="mdi:account-outline"
                width="18"
                height="18"
                class="text-muted"
              />
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入账号"
                class="w-full bg-transparent text-sm outline-none"
                autocomplete="username"
                spellcheck="false"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-xs text-red-500">
              {{ errors.username }}
            </p>
          </div>

          <!-- 密码 -->
          <div class="pointer-events-auto">
            <label class="mb-1.5 block text-sm font-medium text-ink"
              >密码</label
            >
            <div
              class="flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 transition-colors duration-150"
              :class="
                errors.password
                  ? 'border-red-400'
                  : 'border-gray-200 focus-within:border-primary'
              "
            >
              <Icon
                icon="mdi:lock-outline"
                width="18"
                height="18"
                class="text-muted"
              />
              <input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                class="w-full bg-transparent text-sm outline-none"
                autocomplete="current-password"
                spellcheck="false"
              />
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">
              {{ errors.password }}
            </p>
          </div>

          <!-- 错误提示 -->
          <div
            v-if="auth.errorMsg"
            class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            <Icon icon="mdi:alert-circle-outline" width="18" height="18" />
            {{ auth.errorMsg }}
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="auth.loading">登录中…</span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- 演示账号提示 -->
        <div
          class="mt-6 rounded-xl bg-sand px-4 py-3 text-xs leading-relaxed text-muted"
        >
          <p class="font-medium text-ink">演示账号（可直接使用）</p>
          <p class="mt-1">管理员：admin / admin123</p>
          <p>普通用户：user / user123</p>
        </div>
      </div>
    </div>
  </div>
</template>

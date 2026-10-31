<script setup>
// 页脚：品牌 + 三列导航 + 版权
import { Icon } from '@iconify/vue'
import { footer, product } from '../data/mock.js'
</script>

<template>
  <footer class="border-t border-gray-100 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="grid gap-10 md:grid-cols-4">
        <!-- 品牌信息 -->
        <div>
          <a href="#" class="flex items-center gap-2">
            <span class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <Icon icon="mdi:leaf" class="text-white" width="20" height="20" />
            </span>
            <span class="text-lg font-bold">{{ product.name }}</span>
          </a>
          <p class="mt-3 text-sm leading-relaxed text-muted">{{ product.slogan }}</p>
        </div>

        <!-- 导航列 -->
        <div v-for="col in footer.columns" :key="col.title" class="md:col-span-1">
          <h4 class="text-sm font-semibold">{{ col.title }}</h4>
          <ul class="mt-4 space-y-3">
            <li v-for="link in col.links" :key="link.label">
              <a
                :href="link.href"
                class="text-sm text-muted transition-colors duration-150 hover:text-primary"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权 -->
      <div class="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-muted">
        {{ footer.copyright }}
      </div>
    </div>
  </footer>
</template>

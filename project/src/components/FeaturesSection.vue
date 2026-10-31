<script setup>
// 功能特性：6 张卡片；hover 上浮 + 图标底色过渡（150ms 简洁克制）
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { features } from "../data/mock.js";
import { useReveal } from "../utils/useReveal.js";

const gridRef = ref(null);
useReveal(gridRef);
</script>

<template>
  <section id="features" class="py-16 md:py-24">
    <div ref="gridRef" class="mx-auto max-w-6xl px-4 reveal">
      <!-- 区块标题 -->
      <div class="text-center">
        <h2 class="text-3xl font-black leading-snug md:text-4xl">
          <!-- 大号标题使用渐变艺术字 -->
          <span class="text-gradient">一个工作台</span>，覆盖团队高频协作
        </h2>
        <p class="mt-3 text-muted">
          把散落在聊天、文档、邮件里的协作，收进一处。
        </p>
      </div>

      <!-- 特性卡片网格：移动端单列，大屏三列 -->
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in features"
          :key="item.title"
          class="group rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-150 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
        >
          <div
            class="grid size-12 place-items-center rounded-xl bg-sand text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-white"
          >
            <Icon :icon="item.icon" width="26" height="26" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ item.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

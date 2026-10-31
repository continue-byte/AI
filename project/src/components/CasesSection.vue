<script setup>
// 客户案例：3 张案例卡片；截图区为纯 CSS 迷你界面 mock；含空数据态
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { cases } from "../data/mock.js";
import { useReveal } from "../utils/useReveal.js";

const gridRef = ref(null);
useReveal(gridRef);

// 每个案例截图 mock 的配色（仅视觉展示）
const mockPalette = [
  {
    bg: "from-orange-50 to-amber-100",
    chip: "bg-primary/30",
    bar: "bg-primary/20",
    accent: "bg-primary/70",
  },
  {
    bg: "from-teal-50 to-emerald-100",
    chip: "bg-teal/30",
    bar: "bg-teal/20",
    accent: "bg-teal/70",
  },
  {
    bg: "from-sky-50 to-indigo-100",
    chip: "bg-sky-400/30",
    bar: "bg-sky-400/20",
    accent: "bg-sky-400/70",
  },
];
</script>

<template>
  <section id="cases" class="bg-sand py-16 md:py-24">
    <div ref="gridRef" class="mx-auto max-w-6xl px-4 reveal">
      <!-- 区块标题 -->
      <div class="text-center">
        <h2 class="text-3xl font-black leading-snug md:text-4xl">
          <!-- 大号标题使用渐变艺术字 -->
          被小团队信任的<span class="text-gradient">每一天</span>
        </h2>
        <p class="mt-3 text-muted">
          来自设计、研发、市场等不同团队的实践反馈。
        </p>
      </div>

      <!-- 数据态：案例卡片 -->
      <div v-if="cases.length" class="mt-12 grid gap-6 md:grid-cols-3">
        <article
          v-for="(item, i) in cases"
          :key="item.company"
          class="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-150 hover:-translate-y-1 hover:shadow-lg"
        >
          <!-- 截图区：纯 CSS 迷你界面 mock（模拟看板/文档布局，不引本地资源） -->
          <div
            class="aspect-video bg-gradient-to-br p-5"
            :class="mockPalette[i % mockPalette.length].bg"
          >
            <div class="grid h-full grid-cols-3 gap-2.5">
              <div
                v-for="col in 3"
                :key="col"
                class="flex flex-col gap-2 rounded-lg bg-white/70 p-2"
              >
                <div
                  class="h-1 w-2/3 rounded-full"
                  :class="mockPalette[i % mockPalette.length].bar"
                />
                <div
                  v-for="row in 2"
                  :key="row"
                  class="h-7 rounded-md bg-white shadow-sm"
                >
                  <div
                    class="mx-1.5 mt-1.5 h-1 w-3/4 rounded-full bg-gray-200"
                  />
                  <div class="mx-1.5 mt-1 h-1 w-1/2 rounded-full bg-gray-100" />
                </div>
                <div
                  v-if="col === 2"
                  class="mt-auto h-1 rounded-full"
                  :class="mockPalette[i % mockPalette.length].accent"
                />
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold">{{ item.company }}</h3>
              <span
                class="shrink-0 rounded-full bg-sand px-3 py-1 text-xs text-primary"
                >{{ item.tag }}</span
              >
            </div>
            <p class="mt-3 text-sm font-medium">{{ item.title }}</p>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              {{ item.desc }}
            </p>
            <p
              class="mt-4 flex items-center gap-1 text-sm font-semibold text-teal"
            >
              <Icon icon="mdi:trending-up" width="16" height="16" />
              {{ item.stat }}
            </p>
          </div>
        </article>
      </div>

      <!-- 空数据态：占位提示 -->
      <div
        v-else
        class="mt-12 rounded-2xl border border-dashed bg-white py-16 text-center"
      >
        <Icon
          icon="mdi:file-document-outline"
          width="40"
          height="40"
          class="mx-auto text-gray-300"
        />
        <p class="mt-3 text-sm text-muted">暂无案例，敬请期待。</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// Hero 首屏：左文右图；标题使用渐变艺术字；右侧为纯 CSS/SVG 产品看板界面 mock（不引本地资源）
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { hero } from "../data/mock.js";
import { useReveal } from "../utils/useReveal.js";

const blockRef = ref(null);
const visualRef = ref(null);
useReveal(blockRef);
useReveal(visualRef);

// 看板 mock 的静态任务数据（仅视觉展示，非业务数据）
const boardColumns = [
  {
    name: "待办",
    count: 3,
    cards: [
      { title: "设计评审", color: "bg-orange-200/70", w: "w-3/4" },
      { title: "版本排期", color: "bg-amber-100", w: "w-1/2" },
    ],
  },
  {
    name: "进行中",
    count: 2,
    cards: [
      { title: "首页改版", color: "bg-sky-100", w: "w-2/3", progress: 65 },
      { title: "需求整理", color: "bg-teal-100", w: "w-3/5", progress: 30 },
    ],
  },
  {
    name: "已完成",
    count: 5,
    cards: [
      { title: "注册流程", color: "bg-emerald-100", w: "w-4/5", done: true },
      { title: "视觉规范", color: "bg-violet-100", w: "w-3/5", done: true },
    ],
  },
];
</script>

<template>
  <section class="relative overflow-hidden bg-sand">
    <!-- 背景装饰：左上柔和青圆 + 右下水波纹（纯 CSS 渐变） -->
    <div
      class="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-teal/10 blur-2xl"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-primary/10 blur-2xl"
    />

    <div
      class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24"
    >
      <!-- 左侧文案 -->
      <div ref="blockRef" class="reveal">
        <p
          class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-xs font-medium text-primary"
        >
          <Icon icon="mdi:check-circle-outline" width="15" height="15" />
          {{ hero.badge }}
        </p>
        <h1 class="mt-5 text-4xl font-black leading-[1.15] md:text-5xl">
          <!-- 大号标题用渐变艺术字增强视觉吸引力 -->
          <span class="text-gradient">{{ hero.title.split("，")[0] }}，</span>
          <span class="text-gradient">收进一个轻量工作台</span>
        </h1>
        <p class="mt-5 text-base leading-relaxed text-muted md:text-lg">
          {{ hero.subtitle }}
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#cta"
            class="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md"
          >
            {{ hero.primaryCta }}
          </a>
          <a
            href="#features"
            class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-sm font-medium transition-all duration-150 hover:border-primary/30 hover:text-primary"
          >
            <Icon icon="mdi:play-circle-outline" width="20" height="20" />
            {{ hero.secondaryCta }}
          </a>
        </div>
        <!-- 轻量信任点 -->
        <p class="mt-6 flex items-center gap-2 text-xs text-muted">
          <Icon
            icon="mdi:shield-check-outline"
            width="15"
            height="15"
            class="text-teal"
          />
          无需信用卡 · 30 秒注册 · 可随时导出数据
        </p>
      </div>

      <!-- 右侧主视觉：纯 CSS 产品看板界面 mock -->
      <div
        ref="visualRef"
        class="reveal relative mx-auto w-full max-w-md reveal-delay-1"
      >
        <div
          class="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-xl"
        >
          <!-- 窗口标题栏 -->
          <div
            class="flex items-center gap-1.5 border-b border-gray-100 bg-white px-4 py-3"
          >
            <span class="size-2.5 rounded-full bg-gray-200" />
            <span class="size-2.5 rounded-full bg-gray-200" />
            <span class="size-2.5 rounded-full bg-gray-200" />
            <span class="ml-3 flex items-center gap-1 text-xs text-muted">
              <Icon
                icon="mdi:leaf"
                width="12"
                height="12"
                class="text-primary"
              />
              小桔协作 · 团队工作台
            </span>
          </div>

          <!-- 看板三列 -->
          <div class="grid grid-cols-3 gap-3 p-4">
            <div
              v-for="col in boardColumns"
              :key="col.name"
              class="rounded-xl bg-sand p-2.5"
            >
              <div class="flex items-center justify-between px-0.5">
                <p class="text-xs font-medium text-ink">{{ col.name }}</p>
                <span
                  class="rounded-full bg-white px-1.5 text-[10px] text-muted"
                  >{{ col.count }}</span
                >
              </div>
              <div class="mt-2 space-y-1.5">
                <div
                  v-for="(card, i) in col.cards"
                  :key="i"
                  class="rounded-lg border border-white bg-white p-2 shadow-sm"
                >
                  <p
                    class="flex items-center gap-1 text-[10px] font-medium leading-tight"
                  >
                    <span
                      class="size-1.5 shrink-0 rounded-full"
                      :class="card.color"
                    />
                    {{ card.title }}
                  </p>
                  <div
                    v-if="card.progress"
                    class="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100"
                  >
                    <div
                      class="h-full rounded-full bg-teal"
                      :style="{ width: card.progress + '%' }"
                    />
                  </div>
                  <div
                    v-else-if="card.done"
                    class="mt-1.5 flex items-center gap-0.5 text-[9px] text-teal"
                  >
                    <Icon icon="mdi:check" width="10" height="10" />
                    已完成
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部工具栏 -->
          <div
            class="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-2.5"
          >
            <div class="flex items-center gap-1 text-[10px] text-muted">
              <Icon
                icon="mdi:account-multiple-outline"
                width="14"
                height="14"
              />
              12 位成员在线
            </div>
            <div class="flex items-center gap-1 text-[10px] text-muted">
              <Icon
                icon="mdi:chart-line"
                width="14"
                height="14"
                class="text-teal"
              />
              本周进度 82%
            </div>
          </div>
        </div>

        <!-- 浮动浮层卡片：任务完成 -->
        <div
          class="animate-float absolute -top-5 -right-2 flex items-center gap-2 rounded-xl border border-white bg-white px-3.5 py-2.5 shadow-lg md:-right-6"
        >
          <span
            class="grid size-7 place-items-center rounded-lg bg-teal/10 text-teal"
          >
            <Icon icon="mdi:check-bold" width="15" height="15" />
          </span>
          <div>
            <p class="text-xs font-semibold leading-none">任务已完成</p>
            <p class="mt-1 text-[10px] text-muted">本周完成 26 项</p>
          </div>
        </div>

        <!-- 浮动浮层卡片：会议提醒 -->
        <div
          class="animate-float-delay absolute -bottom-5 -left-2 flex items-center gap-2 rounded-xl border border-white bg-white px-3.5 py-2.5 shadow-lg md:-left-6"
        >
          <span
            class="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <Icon icon="mdi:bell-outline" width="15" height="15" />
          </span>
          <div>
            <p class="text-xs font-semibold leading-none">会议提醒</p>
            <p class="mt-1 text-[10px] text-muted">10:30 设计评审</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

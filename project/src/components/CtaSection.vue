<script setup>
// CTA 行动区：渐变横幅 + 装饰网点 + 行动按钮（hover 提亮）
import { Icon } from "@iconify/vue";
import { cta } from "../data/mock.js";

// 联系方式锚点（供导航“联系我们”跳转）
const anchorId = "cta";
</script>

<template>
  <section :id="anchorId" class="px-4 py-16 md:py-24">
    <div
      class="dotted-pattern relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-6 py-14 text-center shadow-xl md:py-16"
    >
      <!-- 装饰：右上柔光圆 -->
      <div
        class="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
      />

      <div class="relative">
        <h2 class="text-3xl font-black text-white md:text-4xl">
          {{ cta.title }}
        </h2>
        <p
          class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base"
        >
          {{ cta.subtitle }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#"
            class="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Icon icon="mdi:rocket-launch-outline" width="18" height="18" />
            {{ cta.primaryCta }}
          </a>
          <a
            href="#"
            class="flex items-center gap-2 rounded-full border border-white/70 px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-white hover:bg-white/10"
          >
            <Icon icon="mdi:calendar-outline" width="18" height="18" />
            {{ cta.secondaryCta }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

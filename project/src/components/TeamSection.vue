<script setup>
// 团队介绍：4 人团队卡片；头像用「名字首字 + 渐变底色」占位（不引本地图片资源）
import { ref } from "vue";
import { team } from "../data/mock.js";
import { useReveal } from "../utils/useReveal.js";

const gridRef = ref(null);
useReveal(gridRef);

// 头像渐变配色（按顺序循环使用）
const avatarPalette = [
  "from-primary to-orange-300",
  "from-teal to-emerald-300",
  "from-sky-400 to-indigo-300",
  "from-amber-400 to-orange-300",
];
</script>

<template>
  <section id="team" class="py-16 md:py-24">
    <div ref="gridRef" class="mx-auto max-w-6xl px-4 reveal">
      <!-- 区块标题 -->
      <div class="text-center">
        <h2 class="text-3xl font-black leading-snug md:text-4xl">
          一群把协作研究到<span class="text-gradient">骨子里</span>的人
        </h2>
        <p class="mt-3 text-muted">我们自己也用 Colabee 协作开发 Colabee。</p>
      </div>

      <!-- 团队卡片：移动端单列，桌面端三列 -->
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(member, i) in team"
          :key="member.name"
          class="rounded-2xl border border-gray-100 bg-white p-6 text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-lg"
        >
          <!-- 头像占位：首字 + 渐变底 -->
          <div
            class="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-sm"
            :class="avatarPalette[i % avatarPalette.length]"
          >
            {{ member.name[0] }}
          </div>
          <h3 class="mt-4 font-semibold">{{ member.name }}</h3>
          <p class="mt-1 text-xs text-primary">{{ member.role }}</p>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ member.desc }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

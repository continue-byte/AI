<script setup>
// 数据成果栏：4 个统计数字；演示 loading → 数据两态；数字滚动（进视口后缓动到目标值）
import { ref, onMounted, onBeforeUnmount } from "vue";
import { stats } from "../data/mock.js";
import { useReveal } from "../utils/useReveal.js";

const loading = ref(true); // 模拟异步加载 loading 态
const list = ref([]);
// 当前滚动展示值：以 label 为键，用于数字动画
const shown = ref({});
// 滚动动画句柄（用于组件卸载时清理）
let animFrames = [];

// 数字滚动：easeOutCubic 缓动，从 0 过渡到目标值
function animateValue(item, duration = 1200) {
  const start = performance.now();
  const from = 0;
  const to = item.value;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    shown.value[item.label] = from + (to - from) * eased;
    if (t < 1) {
      animFrames.push(requestAnimationFrame(step));
    }
  }
  animFrames.push(requestAnimationFrame(step));
}

onMounted(() => {
  // 模拟接口延迟 800ms 返回数据，随后触发数字滚动
  setTimeout(() => {
    list.value = stats;
    loading.value = false;
    stats.forEach((item) => animateValue(item));
  }, 800);
});

onBeforeUnmount(() => {
  // 清理未完成的动画帧
  animFrames.forEach((id) => cancelAnimationFrame(id));
});

const wrapRef = ref(null);
useReveal(wrapRef);

// 按小数位格式化当前滚动值（zh-CN 千分位）
function formatValue(item) {
  const v = shown.value[item.label] ?? 0;
  return v.toLocaleString("zh-CN", {
    minimumFractionDigits: item.decimals,
    maximumFractionDigits: item.decimals,
  });
}
</script>

<template>
  <section id="stats">
    <div ref="wrapRef" class="mx-auto max-w-6xl px-4 py-10 reveal">
      <!-- loading 态：骨架占位 -->
      <div v-if="loading" class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="n in 4"
          :key="n"
          class="h-24 animate-pulse rounded-2xl bg-gray-100"
        />
      </div>

      <!-- 数据态 -->
      <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="item in list"
          :key="item.label"
          class="rounded-2xl bg-sand p-6 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <p class="text-3xl font-black text-primary md:text-4xl">
            {{ formatValue(item)
            }}<span class="text-xl font-bold">{{ item.suffix }}</span>
          </p>
          <p class="mt-2 text-sm text-muted">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

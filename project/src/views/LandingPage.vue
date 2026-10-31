<script setup>
// 落地首页：把已有的 8 个组件按序组装（原 App.vue 的模板内容迁移至此）
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import StatsBar from '../components/StatsBar.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import CasesSection from '../components/CasesSection.vue'
import TeamSection from '../components/TeamSection.vue'
import CtaSection from '../components/CtaSection.vue'
import SiteFooter from '../components/SiteFooter.vue'
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-white font-sans text-ink">
    <!-- ① 顶部导航 -->
    <NavBar />
    <main>
      <!-- ② Hero 首屏 -->
      <HeroSection />
      <!-- ③ 数据成果栏 -->
      <StatsBar />
      <!-- ④ 功能特性 -->
      <FeaturesSection />
      <!-- ⑤ 客户案例 -->
      <CasesSection />
      <!-- ⑥ 团队介绍 -->
      <TeamSection />
      <!-- ⑦ CTA 行动区 -->
      <CtaSection />
    </main>
    <!-- ⑧ 页脚 -->
    <SiteFooter />
  </div>
</template>

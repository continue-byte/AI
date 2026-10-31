// ===== 站点全部 mock 数据（骨架阶段；样式阶段继续沿用，均为原创文案） =====

// 品牌信息
export const product = {
  name: '小桔协作',
  enName: 'Colabee',
  slogan: '让协作变简单',
}

// 顶部导航链接
export const navLinks = [
  { label: '功能', href: '#features' },
  { label: '案例', href: '#cases' },
  { label: '团队', href: '#team' },
  { label: '联系我们', href: '#cta' },
]

// Hero 首屏
export const hero = {
  badge: '已帮助 12,000+ 小团队高效协作',
  title: '把团队的日常协作，收进一个轻量工作台',
  subtitle:
    '任务看板、团队知识库、会议日程三合一，为 5~50 人小团队打造。无需培训，5 分钟上手。',
  primaryCta: '免费开始',
  secondaryCta: '观看演示',
}

// 数据成果栏（value 为滚动目标值；decimals 表示保留小数位）
export const stats = [
  { value: 12000, suffix: '+', label: '活跃团队', decimals: 0 },
  { value: 860, suffix: 'K+', label: '完成协作任务', decimals: 0 },
  { value: 96, suffix: '%', label: '年度续费满意度', decimals: 0 },
  { value: 4.9, suffix: ' / 5', label: '应用商店评分', decimals: 1 },
]

// 功能特性（icon 为 Iconify 图标名）
export const features = [
  {
    icon: 'mdi:view-column-outline',
    title: '任务看板',
    desc: '卡片式看板，拖拽排期，里程碑一目了然。',
  },
  {
    icon: 'mdi:book-open-page-variant-outline',
    title: '团队知识库',
    desc: '沉淀团队文档与经验，搜索即达，新人秒懂。',
  },
  {
    icon: 'mdi:calendar-blank-multiple',
    title: '会议日程',
    desc: '一键约会议，自动同步日历与纪要。',
  },
  {
    icon: 'mdi:bell-ring-outline',
    title: '智能提醒',
    desc: '截止前自动提醒，重要节点一个不错过。',
  },
  {
    icon: 'mdi:lock-outline',
    title: '权限与安全',
    desc: '细粒度权限控制，数据加密存储。',
  },
  {
    icon: 'mdi:chart-box-outline',
    title: '数据洞察',
    desc: '团队效能看板，节奏与进度尽在掌握。',
  },
]

// 客户案例（screenshot 字段为占位标记，视觉在第 3 步实现）
export const cases = [
  {
    company: '青柠设计工作室',
    tag: '设计团队 · 12 人',
    title: '从微信群接龙到看板协作',
    desc: '设计稿排期、评审意见与交付节点全部收进看板，跨人协作不再靠“艾特”。',
    stat: '交付周期缩短 40%',
    screenshot: 'mock',
  },
  {
    company: '松果科技',
    tag: '研发团队 · 26 人',
    title: '需求、迭代、复盘全流程打通',
    desc: '需求池、版本计划与复盘文档串联在一个工作台，信息不再散落各处。',
    stat: '需求漏项减少 60%',
    screenshot: 'mock',
  },
  {
    company: '拾光教育',
    tag: '市场团队 · 8 人',
    title: '活动与内容排期统一管理',
    desc: '每月内容日历、活动分工与素材归档集中管理，节奏清晰可控。',
    stat: '每周例会减少 3 场',
    screenshot: 'mock',
  },
]

// 团队介绍
export const team = [
  { name: '陈锦杰', role: '联合创始人 / CEO', desc: '前设计团队负责人，坚信工具应当克制而可靠。' },
  { name: '蔡昊君', role: '联合创始人 / CTO', desc: '专注团队协作领域十余年，写代码如写散文。' },
  { name: '许志强', role: '产品负责人', desc: '长期研究小团队工作流，产品里藏着一本田野笔记。' },
]

// CTA 行动区
export const cta = {
  title: '让协作从今天开始变简单',
  subtitle: '免费使用全部核心功能，无需信用卡，30 秒完成注册。',
  primaryCta: '免费开始',
  secondaryCta: '预约演示',
}

// 页脚
export const footer = {
  columns: [
    {
      title: '产品',
      links: [
        { label: '功能特性', href: '#features' },
        { label: '客户案例', href: '#cases' },
        { label: '更新日志', href: '#' },
        { label: '路线图', href: '#' },
      ],
    },
    {
      title: '资源',
      links: [
        { label: '帮助中心', href: '#' },
        { label: '使用指南', href: '#' },
        { label: '开发者文档', href: '#' },
        { label: '社区', href: '#' },
      ],
    },
    {
      title: '公司',
      links: [
        { label: '关于我们', href: '#' },
        { label: '加入我们', href: '#' },
        { label: '联系我们', href: '#cta' },
        { label: '隐私政策', href: '#' },
      ],
    },
  ],
  copyright: '© 2026 小桔协作 Colabee · 让协作变简单',
}

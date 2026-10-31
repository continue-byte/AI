// ===== 路由配置 + 守卫 =====
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'home',
    // 落地首页（已有的单页组件容器）
    component: () => import('../views/LandingPage.vue'),
    meta: { title: '小桔协作 Colabee · 让协作变简单' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    meta: { title: '登录 · 小桔协作', guestOnly: true },
  },
  {
    path: '/admin',
    component: () => import('../views/AdminLayout.vue'),
    // 需要登录后才能访问
    meta: { requireAuth: true },
    children: [
      { path: '', redirect: '/admin/users' },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/UserListPage.vue'),
        meta: { title: '用户管理' },
      },
    ],
  },
  // 兜底：未匹配路径回到首页
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// 全局前置守卫
router.beforeEach((to) => {
  // 动态设置页面标题
  if (to.meta?.title) document.title = to.meta.title

  const auth = useAuthStore()

  // 未登录访问需鉴权页面 → 跳登录
  if (to.meta.requireAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 已登录访问登录页 → 直接进后台
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'admin-users' }
  }
})

export default router

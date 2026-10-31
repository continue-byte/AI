// ===== 登录鉴权 store：对接后端 /api/auth/* 接口 =====
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/client.js'

const USER_KEY = 'colabee_auth_user'
const TOKEN_KEY = 'colabee_token'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const loading = ref(false)
  const errorMsg = ref('')

  // 初始化：恢复登录态
  function init() {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      try { currentUser.value = JSON.parse(raw) } catch (_) {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
      }
    }
  }

  const isLoggedIn = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  // 调后端登录接口
  async function login({ username, password }) {
    loading.value = true
    errorMsg.value = ''
    try {
      const { token, user } = await api.login(username, password)
      currentUser.value = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(TOKEN_KEY, token)
      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await api.logout() } catch (_) { /* 后端挂了也要清本地 */ }
    currentUser.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  return { currentUser, loading, errorMsg, isLoggedIn, isAdmin, init, login, logout }
})

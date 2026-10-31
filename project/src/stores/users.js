// ===== 用户列表 store：对接后端 /api/users/* 接口 =====
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/client.js'

export const ROLES = {
  admin: { label: '管理员', color: 'bg-primary/15 text-primary' },
  user: { label: '普通用户', color: 'bg-teal/15 text-teal' },
}

export const USER_STATUS = {
  active: { label: '正常', color: 'bg-teal/15 text-teal' },
  disabled: { label: '已禁用', color: 'bg-red-100 text-red-500' },
}

export const useUsersStore = defineStore('users', () => {
  const list = ref([])
  const loading = ref(false)
  const errorMsg = ref('')

  // 筛选/分页状态
  const keyword = ref('')
  const role = ref('all')
  const status = ref('all')
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 统计（Dashboard 卡片用，独立请求）
  const statsData = ref({ total: 0, admin: 0, user: 0, disabled: 0, active: 0, todayLogin: 0, active7d: 0 })

  const stats = computed(() => statsData.value)

  // ===== 请求：拉取列表 =====
  async function fetchList() {
    loading.value = true
    errorMsg.value = ''
    try {
      const data = await api.list({
        keyword: keyword.value,
        role: role.value,
        status: status.value,
        page: page.value,
        pageSize: pageSize.value,
      })
      list.value = data.items
      total.value = data.total
    } catch (err) {
      errorMsg.value = err.message
      list.value = []
    } finally {
      loading.value = false
    }
  }

  // ===== 请求：拉取统计 =====
  async function fetchStats() {
    try {
      statsData.value = await api.stats()
    } catch (_) { /* 统计请求失败不阻断列表 */ }
  }

  // 同时拉列表 + 统计
  async function init() {
    await Promise.all([fetchList(), fetchStats()])
  }

  // 筛选条件变化 → 重置页码 → 重新拉列表
  function setKeyword(v) { keyword.value = v; page.value = 1 }
  function setRole(v)   { role.value = v;   page.value = 1 }
  function setStatus(v) { status.value = v; page.value = 1 }
  function setPage(v)   { page.value = v }

  // ===== CRUD =====
  async function addUser(payload) {
    errorMsg.value = ''
    try {
      await api.create(payload)
      await fetchList()
      await fetchStats()
      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    }
  }

  async function updateUser(id, payload) {
    errorMsg.value = ''
    try {
      await api.update(id, payload)
      await fetchList()
      await fetchStats()
      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    }
  }

  async function deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      errorMsg.value = '不能删除自己'
      return false
    }
    errorMsg.value = ''
    try {
      await api.remove(id)
      await fetchList()
      await fetchStats()
      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    }
  }

  async function toggleStatus(id) {
    try {
      await api.toggleStatus(id)
      await fetchList()
      await fetchStats()
      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    }
  }

  function getById(id) {
    return list.value.find((u) => u.id === id) || null
  }

  return {
    list, loading, errorMsg, keyword, role, status, page, pageSize, total, stats,
    init, fetchList, fetchStats, setKeyword, setRole, setStatus, setPage,
    addUser, updateUser, deleteUser, toggleStatus, getById,
  }
})

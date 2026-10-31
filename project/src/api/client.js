// ===== 后端 API 请求封装 =====
// 开发环境：走 Vite proxy /api → localhost:3000
// 生产环境：VITE_API_BASE 注入 Render 后端域名（或同域）
const BASE = import.meta.env.VITE_API_BASE || '/api'
console.log('[api] BASE =', BASE)

// 取 token（登录后存 localStorage）
function getToken() {
  return localStorage.getItem('colabee_token') || ''
}

// 通用请求：自动加 JSON header + Bearer token + 统一错误解析
async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('colabee_token')
      const hash = location.hash || '#/'
      if (!hash.includes('/login')) location.hash = '#/login'
    }
    const msg = data.error || data.message || `请求失败 (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  login: (username, password) => request('/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password }),
  }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  list: (query = {}) => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.append(k, v) })
    return request(`/users?${params.toString()}`)
  },
  stats: () => request('/users/stats'),
  create: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  toggleStatus: (id) => request(`/users/${id}/status`, { method: 'PATCH' }),
}

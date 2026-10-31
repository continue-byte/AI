// ===== 用户管理后端：Express + MySQL 真实数据库 =====
// 依赖：express, cors, mysql2, dotenv
// 启动前先执行 server/init.sql 初始化数据库
require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const PORT = Number(process.env.PORT) || 3000

// CORS：开发全开，生产可通过 CORS_ORIGIN 限制
const corsOpts = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(','), credentials: true }
  : { origin: true, credentials: true }
app.use(cors(corsOpts))
app.use(express.json())

// Render MySQL 需要 SSL（本地开发不需要）
if (process.env.DB_SSL === 'true') {
  console.log('🔐 MySQL SSL 已启用（生产环境）')
}

// ===== MySQL 连接池（全局复用）=====
const poolOpts = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'colabee',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
}
// 生产环境（Render）需要 SSL
if (process.env.DB_SSL === 'true') {
  poolOpts.ssl = { rejectUnauthorized: false }
}
const pool = mysql.createPool(poolOpts)

// 启动时连通性检查 + 自动初始化
async function ensureReady() {
  try {
    await pool.query('SELECT 1')
    console.log('✅ MySQL 连接成功')
  } catch (err) {
    console.error('❌ MySQL 连接失败：', err.message)
    console.error('   请检查 server/.env 里的连接配置是否正确')
    console.error('   并确认已执行 server/init.sql 初始化数据库')
    process.exit(1)
  }
}

// ===== 辅助：去掉 password 字段 =====
function sanitize(row) {
  const { password, ...safe } = row
  return safe
}

// ===== 鉴权中间件：用 token 查数据库 =====
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [Number(token)]
    )
    if (!rows.length) return res.status(401).json({ error: 'Token 无效' })
    const user = rows[0]
    if (user.status === 'disabled') return res.status(401).json({ error: '账号已禁用' })
    req.user = sanitize(user)
    next()
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// ===== 1. 登录 / 登出 / 当前用户 =====
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: '账号和密码不能为空' })
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1',
      [username, password]
    )
    if (!rows.length) return res.status(401).json({ error: '账号或密码错误' })
    const user = rows[0]
    if (user.status === 'disabled') return res.status(401).json({ error: '该账号已被禁用' })

    // 更新最后登录时间
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id])

    res.json({ token: String(user.id), user: sanitize(user) })
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' })
  }
})

app.post('/api/auth/logout', authMiddleware, (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// ===== 健康检查 + 数据库初始化 =====

// Render 健康检查端点
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }) }
  catch (err) { res.status(503).json({ ok: false, db: 'down', error: err.message }) }
})

// 一次性初始化：建表 + 插初始数据（Render 上首次部署调一次就行）
// 方法：curl -X POST https://你的后端域名/api/init
app.post('/api/init', async (_req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password VARCHAR(128) NOT NULL,
        name VARCHAR(64) NOT NULL,
        email VARCHAR(128) DEFAULT '',
        role ENUM('admin','user') NOT NULL DEFAULT 'user',
        status ENUM('active','disabled') NOT NULL DEFAULT 'active',
        created_at DATE NOT NULL,
        last_login_at DATETIME DEFAULT NULL,
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    const [existing] = await pool.query('SELECT COUNT(*) AS cnt FROM users')
    if (existing[0].cnt === 0) {
      await pool.query(`
        INSERT INTO users (username, password, name, email, role, status, created_at, last_login_at) VALUES
        ('admin',      'admin123', '超级管理员', 'admin@colabee.cn',      'admin', 'active',   '2025-08-12', '2026-10-31 09:12'),
        ('zhangwei',   'user123',  '张伟',       'zhangwei@colabee.cn',  'user',  'active',   '2025-09-03', '2026-10-30 17:45'),
        ('lina',       'user123',  '李娜',       'lina@colabee.cn',      'user',  'active',   '2025-09-20', '2026-10-31 08:30'),
        ('wangchao',    'user123',  '王超',       'wangchao@colabee.cn',  'user',  'disabled', '2025-10-01', '2026-10-20 14:00'),
        ('chenjie',    'user123',  '陈锦杰',     'chenjie@colabee.cn',  'admin', 'active',   '2025-10-15', '2026-10-31 10:05'),
        ('caihao',     'user123',  '蔡昊君',     'caihao@colabee.cn',    'user',  'active',   '2025-10-22', '2026-10-29 11:20'),
        ('xuzhiqiang', 'user123',  '许志强',     'xuzhiqiang@colabee.cn','user',  'disabled', '2025-10-25', '2026-10-15 16:40'),
        ('zhaofeng',   'user123',  '赵峰',       'zhaofeng@colabee.cn',  'user',  'active',   '2025-11-02', '2026-10-31 07:55')
      `)
      res.json({ ok: true, msg: '数据库初始化完成（表已建 + 8 条初始数据已插入）' })
    } else {
      res.json({ ok: true, msg: '表已存在且有数据，跳过初始化', users: existing[0].cnt })
    }
  } catch (err) {
    console.error('/api/init 失败', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ===== 2. 用户 CRUD =====

// GET /api/users — 列表 + 搜索 + 筛选 + 分页
app.get('/api/users', authMiddleware, async (req, res) => {
  const { keyword = '', role = 'all', status = 'all', page = 1, pageSize = 10 } = req.query
  const kw = keyword.trim()

  const where = []
  const params = []
  if (kw) {
    where.push('(username LIKE ? OR name LIKE ? OR email LIKE ?)')
    const like = `%${kw}%`
    params.push(like, like, like)
  }
  if (role !== 'all') { where.push('role = ?'); params.push(role) }
  if (status !== 'all') { where.push('status = ?'); params.push(status) }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''

  try {
    // 总数
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${whereSql}`, params
    )
    // 分页数据
    const pageNum = Math.max(1, Number(page))
    const size = Math.max(1, Number(pageSize))
    const offset = (pageNum - 1) * size
    const [rows] = await pool.query(
      `SELECT id, username, name, email, role, status, created_at AS createdAt,
              DATE_FORMAT(last_login_at, '%Y-%m-%d %H:%i') AS lastLoginAt
       FROM users ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
      [...params, size, offset]
    )
    res.json({ items: rows, total, page: pageNum, pageSize: size, totalPages: Math.max(1, Math.ceil(total / size)) })
  } catch (err) {
    console.error('GET /api/users', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// GET /api/users/stats — Dashboard 统计
app.get('/api/users/stats', authMiddleware, async (_req, res) => {
  try {
    const [[all]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(role = 'admin') AS admin,
        SUM(role = 'user')  AS user,
        SUM(status = 'disabled') AS disabled,
        SUM(status = 'active')   AS active,
        SUM(DATE(last_login_at) = CURDATE()) AS todayLogin,
        SUM(last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS active7d
      FROM users
    `)
    res.json(all)
  } catch (err) {
    console.error('GET /api/users/stats', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// POST /api/users — 新增
app.post('/api/users', authMiddleware, async (req, res) => {
  const { username, name, email = '', role = 'user' } = req.body
  if (!username?.trim() || !name?.trim()) return res.status(400).json({ error: '账号和姓名不能为空' })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: '邮箱格式不正确' })
  try {
    // 账号唯一校验
    const [dup] = await pool.query('SELECT id FROM users WHERE username = ?', [username.trim()])
    if (dup.length) return res.status(400).json({ error: '该账号已存在' })

    const [result] = await pool.query(
      `INSERT INTO users (username, password, name, email, role, status, created_at)
       VALUES (?, 'user123', ?, ?, ?, 'active', CURDATE())`,
      [username.trim(), name.trim(), email.trim(), role]
    )
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
    res.status(201).json({ user: sanitize(rows[0]) })
  } catch (err) {
    console.error('POST /api/users', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// PUT /api/users/:id — 更新
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  const { username, name, email, role, status } = req.body
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (!existing.length) return res.status(404).json({ error: '用户不存在' })
    const current = existing[0]

    // 账号唯一性校验（改后的账号不能跟别人重）
    if (username !== undefined && username !== current.username) {
      const [dup] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id])
      if (dup.length) return res.status(400).json({ error: '该账号已存在' })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' })
    }

    await pool.query(
      `UPDATE users SET
        username = COALESCE(?, username),
        name     = COALESCE(?, name),
        email    = COALESCE(?, email),
        role     = COALESCE(?, role),
        status   = COALESCE(?, status)
      WHERE id = ?`,
      [username ?? null, name ?? null, email ?? null, role ?? null, status ?? null, id]
    )
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    res.json({ user: sanitize(rows[0]) })
  } catch (err) {
    console.error('PUT /api/users/:id', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// DELETE /api/users/:id — 删除
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: '不能删除自己' })
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id])
    if (!result.affectedRows) return res.status(404).json({ error: '用户不存在' })
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/users/:id', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// PATCH /api/users/:id/status — 切换状态
app.patch('/api/users/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (!rows.length) return res.status(404).json({ error: '用户不存在' })
    const user = rows[0]
    if (id === req.user.id && user.status === 'active') {
      return res.status(400).json({ error: '不能禁用当前登录的自己' })
    }
    const next = user.status === 'active' ? 'disabled' : 'active'
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [next, id])
    const [updated] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    res.json({ user: sanitize(updated[0]) })
  } catch (err) {
    console.error('PATCH /api/users/:id/status', err.message)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ===== 生产环境：托管前端静态文件（单端口部署，前端 build 到 dist/）=====
const path = require('path')
const fs = require('fs')
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA 兜底：非 API 请求返回 index.html（Express 5 已移除 '*' 通配符，改用中间件）
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
  console.log('🌐 前端静态文件已托管：' + distPath)
} else {
  console.log('⚠️  未找到 dist 目录，前端将不托管（开发模式请用 Vite dev server）')
}

// ===== 启动 =====
ensureReady().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务运行中：http://localhost:${PORT}`)
    console.log(`   📦 数据库：${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`)
    console.log(`   🌐 前端页面：http://localhost:${PORT}/`)
  })
})

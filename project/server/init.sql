-- ===== 小桔协作 Colabee 用户管理数据库初始化脚本 =====
-- 先手动在 MySQL 里执行本脚本，再启动后端 server
-- 如果数据库/表已存在，执行时用 SOURCE server/init.sql 即可

CREATE DATABASE IF NOT EXISTS colabee DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE colabee;

-- 用户表
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(64)  NOT NULL UNIQUE COMMENT '登录账号',
  password     VARCHAR(128) NOT NULL COMMENT '密码（本演示用明文，生产请用 bcrypt）',
  name         VARCHAR(64)  NOT NULL COMMENT '姓名',
  email        VARCHAR(128) DEFAULT '' COMMENT '邮箱',
  role         ENUM('admin','user') NOT NULL DEFAULT 'user' COMMENT '角色',
  status       ENUM('active','disabled') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at   DATE NOT NULL COMMENT '创建日期',
  last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 初始 8 个用户（chenjie/caihao/xuzhiqiang 已在）
INSERT INTO users (username, password, name, email, role, status, created_at, last_login_at) VALUES
('admin',        'admin123', '超级管理员', 'admin@colabee.cn',        'admin', 'active',   '2025-08-12', '2026-10-31 09:12'),
('zhangwei',     'user123',  '张伟',       'zhangwei@colabee.cn',    'user',  'active',   '2025-09-03', '2026-10-30 17:45'),
('lina',         'user123',  '李娜',       'lina@colabee.cn',        'user',  'active',   '2025-09-20', '2026-10-31 08:30'),
('wangchao',      'user123',  '王超',       'wangchao@colabee.cn',    'user',  'disabled', '2025-10-01', '2026-10-20 14:00'),
('chenjie',      'user123',  '陈锦杰',     'chenjie@colabee.cn',    'admin', 'active',   '2025-10-15', '2026-10-31 10:05'),
('caihao',       'user123',  '蔡昊君',     'caihao@colabee.cn',      'user',  'active',   '2025-10-22', '2026-10-29 11:20'),
('xuzhiqiang',   'user123',  '许志强',     'xuzhiqiang@colabee.cn', 'user',  'disabled', '2025-10-25', '2026-10-15 16:40'),
('zhaofeng',     'user123',  '赵峰',       'zhaofeng@colabee.cn',    'user',  'active',   '2025-11-02', '2026-10-31 07:55');

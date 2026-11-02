#!/usr/bin/env bash
# ===== 小桔协作 Colabee 一键部署脚本（Ubuntu 20.04 / 22.04）=====
# 用法：git clone 后进入项目目录，执行  bash deploy.sh
# 前提：当前用户能 sudo（云服务器默认 root 即可）
set -e

echo "===== [1/5] 安装 Node.js 18 + git + MySQL ====="
if ! command -v node >/dev/null 2>&1; then
  echo ">> 安装 Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo apt-get install -y git mysql-server

echo "===== [2/5] 安装依赖并构建前端 ====="
npm install
npm run build

echo "===== [3/5] 初始化数据库（建库 + 建表 + 初始数据 + 专用账号）====="
sudo mysql < server/init.sql
sudo mysql <<'EOF'
CREATE USER IF NOT EXISTS 'colabee'@'localhost' IDENTIFIED BY 'colabee123';
GRANT ALL PRIVILEGES ON colabee.* TO 'colabee'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "===== [4/5] 写入环境变量 ====="
cat > server/.env <<'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=colabee
DB_PASSWORD=colabee123
DB_NAME=colabee
PORT=3000
EOF

echo "===== [5/5] 用 pm2 常驻启动 ====="
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi
pm2 start server/index.cjs --name colabee --update-env
pm2 save

echo ""
echo "=============================================="
echo "  部署完成！"
echo "  访问地址：http://你的公网IP:3000"
echo "  登录账号：admin / admin123"
echo "  常用命令："
echo "    查看状态  pm2 status"
echo "    查看日志  pm2 logs colabee"
echo "    重启服务  pm2 restart colabee"
echo "=============================================="
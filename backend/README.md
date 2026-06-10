# 商品网上交易系统 - 后端

## 环境要求

- Node.js >= 16.0.0
- MySQL 8.0+
- 已导入数据库（见 `../database/` 下的 `init.sql` 和 `seed.sql`）

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2.配置环境变量

复制 .env.example 并重命名为 .env，然后填入你的 MySQL 密码：

```bash
cp .env.example .env
# 编辑 .env 文件，修改 DB_PASSWORD=你的MySQL密码
```

### 3.初始化数据库

确保 MySQL 服务已启动，然后在 `database/` 目录下执行：

```bash
mysql -u root -p < init.sql
mysql -u root -p < seed.sql
```

### 4.激活测试账号（可选）

如果 `seed.sql` 中的密码是无效哈希，请运行：

```bash
node fixAllUsers.js
```

这会将所有测试账号密码更新为明文（admin/admin123, seller/seller123, buyer/buyer123）。

### 5.启动服务

```bash
# 开发模式（需全局安装 nodemon）
npm run dev
# 或直接启动
node app.js
```

服务器默认运行在 `http://localhost:3000`。

## 测试账号

| 角色   | 用户名    | 密码      | 状态   |
| ------ | --------- | --------- | ------ |
| 管理员 | admin     | admin123  | 已激活 |
| 卖家   | seller001 | seller123 | 已审核 |
| 卖家   | seller002 | seller123 | 已审核 |
| 买家   | buyer001  | buyer123  | 已激活 |
| 买家   | buyer002  | buyer123  | 已激活 |

*注：在运行* `fixAllUsers.js` *后这些账号才可用。*

## API概览

### 公开接口

- `GET /api/products` - 商品列表（支持 ?page=&pageSize=&categoryId=&keyword=）
- `GET /api/products/:id` - 商品详情
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录（返回 JWT）

### 需认证接口

在 Header 中添加 `Authorization: Bearer <token>`

- `GET /api/users/profile` - 获取个人信息
- `POST /api/products` (seller) - 创建商品
- `PUT /api/products/:id` (seller) - 更新商品
- `DELETE /api/products/:id` (seller) - 下架商品
- `POST /api/orders` (buyer) - 创建订单
- `GET /api/orders/my` (buyer) - 买家订单列表
- `GET /api/orders/seller` (seller) - 卖家订单列表
- `PUT /api/orders/:id/pay` (buyer) - 支付
- `PUT /api/orders/:id/ship` (seller) - 发货
- `PUT /api/orders/:id/receive` (buyer) - 确认收货
- `PUT /api/orders/:id/cancel` - 取消订单

### 管理员接口

- `GET /api/audit/pending` (admin) - 待审核列表
- `PUT /api/audit/process` (admin) - 处理审核
- `PUT /api/products/:id/approve` (admin) - 审核商品

## 常见问题

### **1. 数据库连接失败**

- 检查 MySQL 服务是否启动
- 检查 `.env` 中密码是否正确
- 确认数据库 `online_shopping` 已创建

### **2. 登录失败（用户名或密码错误）**

- 运行 `node fixAllUsers.js` 修复种子数据密码

### **3. 端口被占用**

- 修改 `.env` 中 `PORT=3001` 或其他可用端口

## 项目结构

```txt
backend/
├── config/         # 数据库连接、认证配置
├── controllers/    # 业务逻辑层
├── models/         # 数据访问层
├── middleware/     # 认证中间件
├── routes/         # 路由定义
├── utils/          # 工具函数（统一响应格式）
├── app.js          # 入口文件
└── package.json
```


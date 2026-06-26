# 商品网上交易系统（Shopping Online）

SUD 大三上软件工程课程项目。基于 B/S 架构的轻量级电子商务平台，支持买家、卖家、管理员三种角色，实现商品发布与审核、在线购物、订单管理等全流程交易功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML + CSS + JavaScript + Bootstrap 5 |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcrypt |
| 建模 | PlantUML |
| 协作 | GitHub |

## 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- MySQL 8.0+

### 2. 初始化数据库

```bash
cd database
mysql -u root -p < init.sql
mysql -u root -p < seed.sql
```

### 3. 配置并启动后端

```bash
cd backend
npm install
cp .env.example .env     # 编辑 .env，填入你的 MySQL 密码
node fixAllUsers.js       # 修复测试账号密码（可选）
node app.js               # 启动服务器，默认 http://localhost:3000
```

### 4. 访问前端

浏览器打开 `http://localhost:3000`，后端已通过 `express.static` 托管前端静态文件。

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 卖家 | seller001 | seller123 |
| 卖家 | seller002 | seller123 |
| 买家 | buyer001 | buyer123 |
| 买家 | buyer002 | buyer123 |

## 项目结构

```
shopping-online-main/
├── frontend/                  # 前端静态页面
│   ├── index.html             # 首页
│   ├── css/style.css          # 全局样式
│   ├── js/                    # JS 模块（api.js / main.js / utils.js）
│   └── pages/                 # 业务页面（登录/商品/购物车/订单/审核等10个页面）
├── backend/                   # 后端 Node.js + Express
│   ├── app.js                 # 入口
│   ├── config/                # 数据库连接、JWT 配置
│   ├── routes/                # 路由层（7个路由模块）
│   ├── controllers/           # 业务逻辑层
│   ├── models/                # 数据访问层
│   ├── middleware/             # 认证与授权中间件
│   └── utils/                 # 工具函数（统一响应格式）
├── database/                  # 数据库
│   ├── init.sql               # 建表 DDL
│   └── seed.sql               # 测试数据
├── docs/                      # 项目文档
│   ├── 可行性分析报告.md
│   ├── 软件需求规格说明书.md
│   ├── 软件体系结构设计文档.md
│   ├── CASE工具调研报告.md
│   ├── 数据库设计说明书.md
│   ├── 设计原则论述.md
│   ├── 任务甘特图.xlsx
│   └── UML/                   # UML 图（用例/类图/状态/活动/顺序/部署）
├── 实验一/ ~ 实验十二/         # 各实验报告
└── 实验总览.md                 # 实验完成情况总览
```

## API 概览

**基础 URL**：`http://localhost:3000/api`

### 公开接口

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/products` | 商品列表（分页/搜索/排序/分类筛选） |
| GET | `/products/:id` | 商品详情 |
| GET | `/products/categories` | 分类列表 |
| POST | `/users/register` | 用户注册 |
| POST | `/users/login` | 用户登录（返回 JWT） |

### 需认证接口

Header: `Authorization: Bearer <token>`

| 方法 | 端点 | 角色 | 说明 |
|------|------|------|------|
| GET | `/users/profile` | 所有 | 个人信息 |
| PUT | `/users/profile` | 所有 | 更新信息 |
| GET/POST | `/users/addresses` | 所有 | 地址管理 |
| PUT/DELETE | `/users/addresses/:id` | 所有 | 地址操作 |
| POST | `/products` | seller | 发布商品 |
| PUT/DELETE | `/products/:id` | seller | 管理商品 |
| GET/POST | `/cart` | buyer | 购物车 |
| PUT/DELETE | `/cart/:id` | buyer | 购物车操作 |
| POST | `/orders` | buyer | 创建订单 |
| GET | `/orders` | 所有 | 订单列表 |
| GET | `/orders/:id` | 所有 | 订单详情 |
| PUT | `/orders/:id/status` | 所有 | 状态更新 |
| PUT | `/orders/:id/cancel` | buyer | 取消订单 |
| GET/POST | `/audits` | admin | 审核管理 |
| PUT | `/audits/:id` | admin | 审核处理 |
| POST | `/messages` | 所有 | 发送留言 |
| DELETE | `/messages/:id` | 所有 | 删除留言 |
| GET/POST | `/favorites` | buyer | 收藏管理 |
| DELETE | `/favorites/:id` | buyer | 取消收藏 |

统一响应格式：`{ code: 200, message: "success", data: {...} }`

## 功能模块

| 模块 | 功能 |
|------|------|
| 用户管理 | 注册（买家/卖家）、登录（角色选择）、JWT 认证、个人信息、地址管理 |
| 商品管理 | 发布/编辑/删除商品、分类筛选、关键词搜索、排序、详情展示 |
| 购物车 | 添加商品、修改数量、删除、清空 |
| 订单管理 | 创建订单（商品快照）、支付、发货、收货、取消、状态流转 |
| 审核管理 | 卖家注册审核、商品发布审核、商品编辑重新审核 |
| 留言 | 对商品留言、树形回复结构 |
| 收藏 | 收藏/取消收藏、收藏列表、收藏状态检查 |

## 项目文档

| 文档 | 位置 |
|------|------|
| 可行性分析报告 | [docs/可行性分析报告.md](docs/可行性分析报告.md) |
| 软件需求规格说明书(SRS) | [docs/软件需求规格说明书.md](docs/软件需求规格说明书.md) |
| 软件体系结构设计文档(SAD) | [docs/软件体系结构设计文档.md](docs/软件体系结构设计文档.md) |
| CASE 工具调研报告 | [docs/CASE工具调研报告.md](docs/CASE工具调研报告.md) |
| 数据库设计说明书 | [docs/数据库设计说明书.md](docs/数据库设计说明书.md) |
| 设计原则论述 | [docs/设计原则论述.md](docs/设计原则论述.md) |
| 项目甘特图 | [docs/任务甘特图.xlsx](docs/任务甘特图.xlsx) |
| UML 建模 | [docs/UML/](docs/UML/) |
| 实验总览 | [实验总览.md](实验总览.md) |

## 团队

| 姓名 | 角色 |
|------|------|
| 王方照 | 组长 / 系统设计 / 文档编写 |
| 陈鑫宇 | 数据库设计与维护 |
| 李岳林 | 后端开发（一） |
| 黎秋雨 | 后端开发（二） |
| 迟鸣浩 | 前端开发 |

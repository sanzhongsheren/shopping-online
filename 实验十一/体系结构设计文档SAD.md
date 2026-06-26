---

# 商品网上交易系统——软件体系结构设计文档（SAD）

**文档编号**：SAD-V1.0
**项目名称**：商品网上交易系统
**编写日期**：2026-05-30
**编写人**：一二三小组全体成员

| 版本 | 日期 | 描述 | 编写人 |
|------|------|------|--------|
| V1.0 | 2026-05-30 | 最终版完成 | 小组全体成员 |

---

## 1 引言

### 1.1 标识

本文档适用于**商品网上交易系统**项目，该系统为基于B/S架构的轻量级电子商务平台。

- **系统名称**：商品网上交易系统（Shopping Online System）
- **文档类型**：软件体系结构设计文档（SAD）
- **参考标准**：GB/T 8567-2006、IEEE 42010-2011

### 1.2 系统概述

商品网上交易系统实现用户注册登录、商品发布与审核、在线购物、订单管理等功能，支持买家、卖家、管理员三种角色。

### 1.3 文档概述

本文档描述了商品网上交易系统的软件体系结构，包括体系结构风格、4+1视图、关键设计决策、接口设计和安全架构等。

### 1.4 参考文献

| 编号 | 文献名称 | 来源 | 日期 |
|------|----------|------|------|
| [1] | GB/T 8567-2006《计算机软件文档编制规范》 | 国家标准 | 2006 |
| [2] | IEEE 42010-2011《系统和软件工程——架构描述》 | IEEE | 2011 |
| [3] | 《软件体系结构》David Garlan & Mary Shaw | — | 1994 |
| [4] | On the Criteria To Be Used in Decomposing Systems into Modules | D.L. Parnas | 1972 |
| [5] | 《商品网上交易系统——软件需求规格说明书》 | 项目小组 | 2026-05 |
| [6] | 《商品网上交易系统——数据库设计说明书》 | 项目小组 | 2026-05 |

---

## 2 引用文件

| 编号 | 文件名称 | 文件编号 |
|------|----------|----------|
| RF-01 | 软件需求规格说明书 | SRS-V1.0 |
| RF-02 | 数据库设计说明书 | DB-V1.0 |
| RF-03 | 可行性分析报告 | FAR-V2.0 |

---

## 3 体系结构设计

### 3.1 体系结构风格

#### 3.1.1 整体风格：分层架构

本系统采用**分层架构 (Layered Architecture)** 作为核心架构风格，共分为5层：

```
┌──────────────────────────────────────────────────┐
│          表示层 (Presentation Layer)              │
│      HTML + CSS + JavaScript + Bootstrap 5       │
│      位置：frontend/*                             │
├──────────────────────────────────────────────────┤
│          路由层 (Route Layer)                     │
│      Express Router——URL到处理函数的映射          │
│      位置：backend/routes/*                       │
├──────────────────────────────────────────────────┤
│          业务逻辑层 (Business Logic Layer)        │
│      Controllers——请求处理与业务编排             │
│      位置：backend/controllers/*                  │
├──────────────────────────────────────────────────┤
│          数据访问层 (Data Access Layer)           │
│      Models——数据库CRUD操作封装                  │
│      位置：backend/models/*                       │
├──────────────────────────────────────────────────┤
│          持久化层 (Persistence Layer)             │
│      MySQL 8.0 关系型数据库                       │
│      位置：database/*                             │
└──────────────────────────────────────────────────┘
```

**分层约束**：
- 上层可以调用下层，下层**不能**调用上层
- 跨层调用允许（如路由层可访问中间件层），但需显式声明
- 每层只暴露必要接口给上一层

**选择理由**：
1. 5人学生团队规模，分层架构简单易懂，学习成本低
2. Web应用的天然分层结构（浏览器→服务器→数据库）
3. 各层职责明确，不同成员可并行开发不同层

#### 3.1.2 辅助风格：MVC变体

系统的路由层、控制器层和数据访问层共同构成一个MVC变体：

| MVC角色 | 本项目对应 | 说明 |
|---------|-----------|------|
| Model | backend/models/ | 数据模型、数据库操作 |
| View | frontend/* (HTML/CSS/JS) | 前端页面 |
| Controller | backend/controllers/ + backend/routes/ | 请求处理与业务逻辑 |

#### 3.1.3 接口风格：RESTful API

前后端之间采用 RESTful 架构风格进行通信：

- **资源导向**：URL 表示资源（`/api/products`, `/api/orders`）
- **标准HTTP方法**：GET（获取）、POST（创建）、PUT（更新）、DELETE（删除）
- **无状态**：每次请求包含完整的认证Token，服务器不保存客户端会话状态
- **统一响应格式**：JSON格式，`{ code, message, data }`

### 3.2 体系结构视图（4+1视图模型）

#### 3.2.1 逻辑视图——功能模块分解

系统从逻辑上划分为7个功能模块：

```
┌─────────────────────────────────────────────┐
│              商品网上交易系统                 │
├──────┬──────┬──────┬──────┬─────┬─────┬─────┤
│用户  │商品  │购物车│订单  │审核  │留言  │收藏  │
│管理  │管理  │模块  │管理  │管理  │模块  │模块  │
│模块  │模块  │      │模块  │模块  │      │      │
└──────┴──────┴──────┴──────┴─────┴─────┴─────┘
```

**模块间依赖关系**：
- 用户管理模块：无依赖（基础模块）
- 商品管理模块：依赖用户管理（需要卖家身份）
- 购物车模块：依赖用户管理 + 商品管理
- 订单管理模块：依赖用户管理 + 商品管理 + 购物车模块
- 审核管理模块：依赖用户管理 + 商品管理
- 留言模块：依赖用户管理 + 商品管理
- 收藏模块：依赖用户管理 + 商品管理

#### 3.2.2 开发视图——代码组织结构

```
shopping-online-main/
├── frontend/                  # 前端：单页面应用 + HTML多页面
│   ├── index.html             # 首页
│   ├── css/style.css          # 全局样式
│   ├── js/
│   │   ├── main.js            # 主页交互逻辑
│   │   ├── api.js             # API调用封装
│   │   └── utils.js           # 工具函数
│   └── pages/                 # 各业务页面
│       ├── login.html
│       ├── product-list.html
│       ├── product-detail.html
│       ├── cart.html
│       ├── checkout.html
│       ├── order.html
│       ├── audit.html
│       ├── user-profile.html
│       └── messages.html
│
├── backend/                   # 后端：Node.js + Express
│   ├── app.js                 # 应用入口
│   ├── config/
│   │   ├── db.js              # 数据库连接
│   │   └── auth.js            # JWT配置
│   ├── routes/                # 路由定义
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── audit.js
│   │   ├── messages.js
│   │   └── favorites.js
│   ├── controllers/           # 业务逻辑
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── auditController.js
│   │   ├── messageController.js
│   │   └── favoriteController.js
│   ├── models/                # 数据模型
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── order.js
│   │   ├── cart.js
│   │   ├── audit.js
│   │   ├── message.js
│   │   └── favorite.js
│   ├── middleware/
│   │   ├── auth.js            # 认证JWT + 角色权限
│   │   └── validator.js       # 输入校验
│   └── utils/
│       └── response.js        # 统一响应格式
│
├── database/                  # 数据库
│   ├── init.sql               # 建表DDL
│   ├── seed.sql               # 测试数据
│   └── README.md              # 部署说明
│
└── docs/                      # 项目文档
    ├── 可行性分析报告.md
    ├── 数据库设计说明书.md
    ├── case调查.md
    ├── 任务甘特图.xlsx
    └── UML/                   # UML图
```

#### 3.2.3 进程视图——运行时模型

```
┌──────────┐  HTTP Request   ┌──────────────┐  SQL Query  ┌─────────┐
│ Browser  │ ───────────────→ │ Node.js      │ ──────────→ │ MySQL   │
│ (多实例)  │ ←─────────────── │ Express (单进程)│ ←────────── │ DB      │
└──────────┘  JSON Response  │ (Event Loop) │  Result Set └─────────┘
                             └──────────────┘
```

**运行时特征**：
- Node.js 基于事件循环的单线程模型处理并发请求
- 中间件链逐层处理：CORS → JSON Parse → Auth → Route → Controller → Model → DB
- 数据库连接池：使用 mysql2/pool，最大连接数10
- 无状态：JWT Token 携带认证信息，服务器无需维护会话状态

#### 3.2.4 物理视图——部署拓扑

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  客户端PC    │     │  服务器PC    │     │  数据库服务器 │
│              │     │              │     │              │
│  Chrome/     │────→│  Node.js     │────→│  MySQL 8.0   │
│  Edge/       │HTTP │  Express     │SQL  │  端口:3306   │
│  Firefox     │:3000│  端口:3000   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘

当前部署方案：
- 开发环境：所有组件运行在同一台PC上
- 前端文件：Express作为静态文件服务器托管
- 生产环境（可选）：使用Nginx反向代理 + HTTPS
```

#### 3.2.5 场景视图——关键用例协调

以**用户下单场景**为例，描述各组件如何协作：

```
买家 → 登录 → 浏览商品 → 加入购物车 → 结算 → 选择地址 → 确认下单
                                                          │
        ┌─────────────────────────────────────────────────┘
        ▼
Route: POST /api/orders (authenticate + authorizeRoles("buyer"))
        │
        ▼
Controller: orderController.createOrder()
  ├── 参数校验：items、addressId、paymentMethod
  ├── 计算总金额：验证购物车商品与提交商品一致性
  ├── 生成订单号：ORD + YYYYMMDD + 6位序号
  ├── 开启数据库事务
  │   ├── 创建订单主记录 (orders)
  │   ├── 创建订单明细记录 (order_items)  —— 商品快照
  │   ├── 更新商品库存 (products.stock)
  │   └── 清空购物车 (cart)
  ├── 提交事务
  └── 返回订单信息
        │
        ▼
Response: { code: 200, message: "订单创建成功", data: { orderNo, totalAmount, ... } }
```

### 3.3 关键设计决策

| 决策ID | 决策内容 | 理由 | 影响 |
|--------|----------|------|------|
| AD-01 | 采用分层架构 | 团队规模小、易理解、Web应用天然匹配 | 各层独立演进，简化团队分工 |
| AD-02 | Express作为后端框架 | 入门快、生态丰富、文档完善 | 后端技术学习成本低 |
| AD-03 | JWT无状态认证 | 会话不存储于服务器，水平扩展友好 | 每次请求携带Token，头部稍大 |
| AD-04 | 前后端分离(REST API) | 支持前端多页面独立开发 | 前端调用API需处理跨域(CORS) |
| AD-05 | 不使用ORM，直接SQL | 降低学习成本，SQL透明可控 | 数据访问代码量稍大，查询灵活 |
| AD-06 | 三层架构(Routes→Controllers→Models) | 关注点分离，各层职责独立 | 增加项目文件数量，但维护性提高 |
| AD-07 | 订单使用商品快照 | 防止商品信息变更影响历史订单 | 数据库增加了重复存储 |
| AD-08 | 密码bcrypt加密 | 业界安全标准 | 登录时额外哈希计算开销（可接受） |

### 3.4 接口设计

#### 3.4.1 前端-后端接口（REST API）

**基础URL**：`http://localhost:3000/api`

**API概览**：

| 资源 | 方法 | 端点 | 认证 | 角色 |
|------|------|------|------|------|
| 用户 | POST | `/users/register` | 否 | - |
| 用户 | POST | `/users/login` | 否 | - |
| 用户 | GET | `/users/profile` | 是 | 所有 |
| 用户 | PUT | `/users/profile` | 是 | 所有 |
| 地址 | GET | `/users/addresses` | 是 | 所有 |
| 地址 | POST | `/users/addresses` | 是 | 所有 |
| 地址 | PUT | `/users/addresses/:id` | 是 | 所有 |
| 地址 | DELETE | `/users/addresses/:id` | 是 | 所有 |
| 商品 | GET | `/products` | 否 | - |
| 商品 | GET | `/products/:id` | 否 | - |
| 商品 | POST | `/products` | 是 | seller |
| 商品 | PUT | `/products/:id` | 是 | seller |
| 商品 | DELETE | `/products/:id` | 是 | seller |
| 购物车 | GET | `/cart` | 是 | buyer |
| 购物车 | POST | `/cart` | 是 | buyer |
| 购物车 | PUT | `/cart/:id` | 是 | buyer |
| 购物车 | DELETE | `/cart/:id` | 是 | buyer |
| 购物车 | DELETE | `/cart` | 是 | buyer |
| 订单 | POST | `/orders` | 是 | buyer |
| 订单 | GET | `/orders` | 是 | 所有 |
| 订单 | GET | `/orders/:id` | 是 | 所有 |
| 订单 | PUT | `/orders/:id/status` | 是 | 所有 |
| 订单 | PUT | `/orders/:id/cancel` | 是 | buyer |
| 审核 | GET | `/audits` | 是 | admin |
| 审核 | POST | `/audits` | 是 | 所有 |
| 审核 | PUT | `/audits/:id` | 是 | admin |
| 留言 | GET | `/messages` | 否 | - |
| 留言 | POST | `/messages` | 是 | 所有 |
| 留言 | DELETE | `/messages/:id` | 是 | 所有 |
| 收藏 | GET | `/favorites` | 是 | buyer |
| 收藏 | POST | `/favorites` | 是 | buyer |
| 收藏 | DELETE | `/favorites/:id` | 是 | buyer |
| 收藏 | GET | `/favorites/check/:id` | 是 | buyer |

**统一响应格式**：
```json
// 成功
{ "code": 200, "message": "success", "data": {...} }
// 失败
{ "code": 400, "message": "请求参数错误" }
// 认证失败
{ "code": 401, "message": "未登录或Token已过期" }
// 权限不足
{ "code": 403, "message": "权限不足" }
```

#### 3.4.2 后端-数据库接口

通过 `mysql2` 驱动连接：

```js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'online_shopping',
  charset: 'utf8mb4'
});
// 导出 pool.execute() 供模型层使用
```

### 3.5 数据架构

#### 3.5.1 数据持久化策略

| 策略项 | 选择 | 说明 |
|--------|------|------|
| 数据库 | MySQL 8.0 | 关系型数据库，适合电商交易场景 |
| 字符集 | utf8mb4 | 支持完整Unicode字符（含emoji） |
| 存储引擎 | InnoDB | 支持事务、行级锁、外键约束 |
| ORM | 不使用 | 直接编写SQL，利用mysql2驱动 |

#### 3.5.2 数据访问模式

```
Controller (业务层)
  │
  ├── Order.createOrder(userId, addressId, items)
  │     └── Model: Order
  │           ├── db.execute('INSERT INTO orders...')
  │           ├── db.execute('INSERT INTO order_items...')
  │           └── db.execute('DELETE FROM cart...')
  │                 (在同一事务中，保证数据一致性)
  │
  └── Product.getProductById(productId)
        └── Model: Product
              └── db.execute('SELECT * FROM products WHERE product_id = ?', [id])
```

**事务保障**：订单创建等关键操作使用数据库事务：
```sql
START TRANSACTION;
INSERT INTO orders ... ;
INSERT INTO order_items ... ;
UPDATE products SET stock = stock - ? WHERE product_id = ?;
DELETE FROM cart WHERE user_id = ? AND product_id IN (...);
COMMIT;
-- 任一操作失败则 ROLLBACK
```

### 3.6 安全架构

#### 3.6.1 认证机制（JWT）

```
用户登录 → 验证用户名+密码 → 生成JWT Token → 返回客户端
后续请求 → Header: Authorization: Bearer <token> → 服务端验证Token → 放行/拒绝
```

- **Token生成**：包含 userId、username、role，有效期24小时
- **Token验证**：`middleware/auth.js` 中的 `authenticate` 中间件
- **Token刷新**：本项目V1.0暂不实现，Token过期后需重新登录

#### 3.6.2 授权机制（基于角色）

```
角色权限矩阵：
          │ 浏览商品 │ 发布商品 │ 创建订单 │ 发货 │ 审核 │ 管理用户
──────────┼─────────┼─────────┼─────────┼─────┼─────┼─────────
  buyer   │   ✅    │   ❌    │   ✅    │ ❌  │ ❌  │   ❌
  seller  │   ✅    │   ✅    │   ❌    │ ✅  │ ❌  │   ❌
  admin   │   ✅    │   ❌    │   ❌    │ ❌  │ ✅  │   ✅
```

实现方式：`authorizeRoles(...roles)` 中间件函数的rest参数设计，支持任意角色扩展。

#### 3.6.3 数据安全

| 安全措施 | 实现方式 |
|----------|----------|
| 密码加密 | bcrypt哈希（salt rounds = 10） |
| SQL注入防护 | 使用参数化查询（`db.execute(sql, params)`），杜绝字符串拼接 |
| XSS防护 | 前端对用户输入进行转义输出 |
| 敏感信息保护 | 身份证号等字段在数据库中以密文形式存储或评估是否需要存储 |
| 输入校验 | `middleware/validator.js` 对所有用户输入进行合法性验证 |

---

## 附录A：术语定义

| 术语 | 定义 |
|------|------|
| SAD | Software Architecture Document，软件体系结构设计文档 |
| MVC | Model-View-Controller，模型-视图-控制器架构模式 |
| REST | Representational State Transfer，表述性状态转移 |
| JWT | JSON Web Token，基于JSON的身份认证令牌 |
| 4+1 Views | Philippe Kruchten提出的架构视图模型 |
| KWIC | Key Word In Context，上下文关键词索引（经典体系结构案例） |
| ADR | Architecture Decision Record，架构决策记录 |
| CSCI | Computer Software Configuration Item，计算机软件配置项 |

## 附录B：架构决策记录（ADR）

### ADR-001: 选择Express作为后端框架

- **背景**：需要选择一个后端框架进行API开发
- **决策**：选择Express而非SpringBoot/Django
- **理由**：前后端统一JavaScript语言，学习成本低；社区庞大、资料丰富；适合中小型项目
- **后果**：Express本身不提供ORM和输入校验，需额外引入中间件

### ADR-002: 不使用ORM

- **背景**：需要选择数据库访问方式
- **决策**：直接使用参数化SQL，不使用ORM（如Sequelize）
- **理由**：降低学习曲线，SQL透明性好，适合教学项目
- **后果**：缺少对象关系映射的便利性，查询需要手写SQL

### ADR-003: 采用JWT无状态认证

- **背景**：需要选择用户认证方案
- **决策**：JWT代替Session/Cookie认证
- **理由**：前后端分离场景天然适合JWT；无需服务器端存储会话；水平扩展友好
- **后果**：Token体积较大；Token签发后无法主动失效（V1.0不实现黑名单）

---

**文档结束**
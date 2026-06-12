# 商品网上交易系统 - 前端

## 说明

前端为纯静态页面（HTML + CSS + JavaScript），通过后端 Express 静态文件服务托管，无需额外构建工具。

## 快速开始

确保后端已启动（参见 `../backend/README.md`），然后浏览器打开：

```
http://localhost:3000
```

后端 `app.js` 已配置 `express.static` 将前端目录映射为根路径，所有页面均可直接访问。

## 页面清单

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/index.html` | 商品分类导航、轮播推荐、热销商品列表 |
| 登录注册 | `/pages/login.html` | 登录 / 注册，支持角色选择（买家/卖家/管理员） |
| 商品列表 | `/pages/product-list.html` | 分类筛选、排序、分页 |
| 商品详情 | `/pages/product-detail.html` | 商品信息、留言、收藏 |
| 购物车 | `/pages/cart.html` | 购物车管理（数量调整、删除、结算） |
| 结算 | `/pages/checkout.html` | 选择地址、确认订单、提交订单 |
| 订单 | `/pages/order.html` | 我的订单（买家/卖家双视角） |
| 个人中心 | `/pages/user-profile.html` | 个人信息、地址管理、收藏、商品管理（卖家） |
| 审核管理 | `/pages/audit.html` | 管理员审核用户注册和商品发布 |
| 留言中心 | `/pages/messages.html` | 留言列表 |

## JavaScript 模块

### `js/api.js` — API 接口层

封装所有后端接口调用，统一处理响应格式解包和 Token 管理。

```js
API.getProducts(params)    // 商品列表
API.getProduct(id)         // 商品详情
API.getCategories()        // 分类列表
API.getCart()              // 购物车
API.createOrder(data)      // 创建订单
API.getMyOrders()          // 买家订单
API.getSellerOrders()      // 卖家订单
API.getFavorites()         // 收藏列表
API.getMessages(params)    // 留言列表
API.login(data)            // 登录（自动保存 Token）
API.register(data)         // 注册
```

所有接口自动附加 `Authorization` 请求头，返回解包后的 `data` 数据。

### `js/main.js` — 主交互逻辑

- 用户状态管理（从 `localStorage` 加载/保存）
- 导航栏渲染（根据角色显示不同菜单项）
- 页面跳转、登录检查、退出登录
- 全局搜索、购物车角标更新

### `js/utils.js` — 工具函数

| 函数 | 说明 |
| --- | --- |
| `Utils.formatPrice()` | 格式化价格 |
| `Utils.formatDate()` | 格式化日期 |
| `Utils.toast()` | 消息通知 |
| `Utils.validateForm()` | 表单验证 |
| `Utils.getStorage()` | localStorage 安全读取 |
| `Utils.statusBadge()` | 状态标签 HTML |
| `Utils.roleBadge()` | 角色标签 HTML |

## 样式

`css/style.css` — 自定义样式，基于 Bootstrap 5 覆盖，包含：

- 页面布局（顶部导航、页脚、内容区）
- 商品卡片、侧栏、表单样式
- Toast 通知动画
- 状态标签、角色标签色彩

## 项目结构

```txt
frontend/
├── css/
│   └── style.css          # 全局样式
├── js/
│   ├── api.js             # API 接口封装
│   ├── main.js            # 主交互逻辑
│   └── utils.js           # 工具函数
├── pages/
│   ├── login.html         # 登录/注册
│   ├── product-list.html  # 商品列表
│   ├── product-detail.html# 商品详情
│   ├── cart.html          # 购物车
│   ├── checkout.html      # 结算
│   ├── order.html         # 订单管理
│   ├── user-profile.html  # 个人中心
│   ├── audit.html         # 审核管理
│   └── messages.html      # 留言中心
└── index.html             # 首页
```

## 测试账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | admin | admin123 |
| 卖家 | seller001 | seller123 |
| 卖家 | seller002 | seller123 |
| 买家 | buyer001 | buyer123 |
| 买家 | buyer002 | buyer123 |

## 常见问题

### **1. 页面一直显示"加载中..."**

- 确认后端服务已启动（`http://localhost:3000` 可访问）
- 打开浏览器开发者工具（F12）→ 控制台，查看是否有网络请求错误

### **2. 登录后跳转到登录页**

- Token 已过期，重新登录即可

### **3. 页面样式错乱**

- 确认网络可访问 Bootstrap 5 和 Font Awesome 6 的 CDN 资源

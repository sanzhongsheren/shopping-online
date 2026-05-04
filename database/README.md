# 数据库说明文档

## 数据库信息
- **数据库名称**: online_shopping
- **数据库类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **存储引擎**: InnoDB

## 文件说明

| 文件 | 说明 |
|------|------|
| init.sql | 数据库初始化脚本，创建所有数据表及约束 |
| seed.sql | 测试数据填充脚本，插入测试用账号、商品、订单等数据 |
| README.md | 本说明文档 |

## 快速开始

### 1. 创建数据库并导入表结构
```bash
mysql -u root -p < init.sql
```
或
```bash
mysql -u root -p
source init.sql
```

### 2. 导入测试数据
```bash
mysql -u root -p < seed.sql
```
或
```bash
mysql -u root -p
source seed.sql
```

## 数据表清单

本数据库共包含10张数据表：

| 序号 | 表名 | 说明 |
|------|------|------|
| 1 | users | 用户表 |
| 2 | addresses | 收货地址表 |
| 3 | categories | 商品分类表 |
| 4 | products | 商品表 |
| 5 | cart | 购物车表 |
| 6 | orders | 订单主表 |
| 7 | order_items | 订单明细表 |
| 8 | audits | 审核记录表 |
| 9 | messages | 留言表 |
| 10 | favorites | 收藏表 |

## 测试账号

| 角色 | 用户名 | 密码 | 状态 |
|------|--------|------|------|
| 管理员 | admin | admin123 | active |
| 卖家 | seller001 | seller123 | approved |
| 卖家 | seller002 | seller123 | approved |
| 卖家 | seller003 | seller123 | pending |
| 买家 | buyer001 | buyer123 | active |
| 买家 | buyer002 | buyer123 | active |
| 买家 | buyer003 | buyer123 | pending |

## 数据库连接配置

后端连接数据库请参考: `backend/config/db.js`

```javascript
module.exports = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_password',
  database: 'online_shopping'
};
```

## 详细设计文档

数据库详细设计说明请查看: `../docs/数据库设计说明书.md`

-- ============================================
-- 商品网上交易系统 数据库初始化脚本
-- 版本: V1.0
-- 创建日期: 2026-05-04
-- 描述: 创建所有数据表及约束
-- ============================================

DROP DATABASE IF EXISTS online_shopping;
CREATE DATABASE online_shopping DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_shopping;
SET NAMES utf8mb4;

-- ----------------------------
-- 1. 用户表 (users)
-- ----------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer' COMMENT '角色: buyer买家/seller卖家/admin管理员',
    status ENUM('pending', 'approved', 'rejected', 'active', 'disabled') NOT NULL DEFAULT 'pending' COMMENT '账号状态',
    real_name VARCHAR(200) COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号(卖家审核用)',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. 收货地址表 (addresses)
-- ----------------------------
DROP TABLE IF EXISTS addresses;
CREATE TABLE addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
    user_id INT NOT NULL COMMENT '用户ID',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    province VARCHAR(200) NOT NULL COMMENT '省份',
    city VARCHAR(200) NOT NULL COMMENT '城市',
    district VARCHAR(200) NOT NULL COMMENT '区县',
    detail_address VARCHAR(255) NOT NULL COMMENT '详细地址',
    postal_code VARCHAR(10) COMMENT '邮政编码',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否为默认地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- ----------------------------
-- 3. 商品分类表 (categories)
-- ----------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    category_name VARCHAR(200) NOT NULL COMMENT '分类名称',
    parent_id INT NULL COMMENT '父分类ID(顶级为NULL)',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- ----------------------------
-- 4. 商品表 (products)
-- ----------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    seller_id INT NOT NULL COMMENT '卖家ID',
    category_id INT COMMENT '分类ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    stock INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    unit VARCHAR(20) DEFAULT '' COMMENT '计量单位',
    image_url VARCHAR(255) COMMENT '商品主图URL',
    images JSON COMMENT '商品图片列表(JSON数组)',
    status ENUM('pending', 'approved', 'rejected', 'onsale', 'offsale', 'deleted') NOT NULL DEFAULT 'pending' COMMENT '商品状态',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    sales_count INT DEFAULT 0 COMMENT '销量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_product_name (product_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ----------------------------
-- 5. 购物车表 (cart)
-- ----------------------------
DROP TABLE IF EXISTS cart;
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车ID',
    user_id INT NOT NULL COMMENT '用户ID(买家)',
    product_id INT NOT NULL COMMENT '商品ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- ----------------------------
-- 6. 订单主表 (orders)
-- ----------------------------
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    buyer_id INT NOT NULL COMMENT '买家ID',
    address_id INT NOT NULL COMMENT '收货地址ID',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
    status ENUM('pending_payment', 'paid', 'shipped', 'received', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending_payment' COMMENT '订单状态',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_time TIMESTAMP NULL COMMENT '支付时间',
    shipping_time TIMESTAMP NULL COMMENT '发货时间',
    received_time TIMESTAMP NULL COMMENT '收货时间',
    cancel_time TIMESTAMP NULL COMMENT '取消时间',
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    buyer_message VARCHAR(255) COMMENT '买家留言',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE RESTRICT,
    INDEX idx_order_no (order_no),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- ----------------------------
-- 7. 订单明细表 (order_items)
-- ----------------------------
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    order_id INT NOT NULL COMMENT '订单ID',
    product_id INT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称(快照)',
    product_image VARCHAR(255) COMMENT '商品图片(快照)',
    price DECIMAL(10, 2) NOT NULL COMMENT '单价(快照)',
    quantity INT NOT NULL COMMENT '购买数量',
    subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------
-- 8. 审核记录表 (audits)
-- ----------------------------
DROP TABLE IF EXISTS audits;
CREATE TABLE audits (
    audit_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '审核ID',
    audit_type ENUM('user_register', 'product_publish', 'product_edit') NOT NULL COMMENT '审核类型',
    target_type ENUM('user', 'product') NOT NULL COMMENT '目标类型',
    target_id INT NOT NULL COMMENT '目标ID(用户ID或商品ID)',
    applicant_id INT NOT NULL COMMENT '申请人ID',
    auditor_id INT NULL COMMENT '审核人ID',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    reject_reason VARCHAR(255) COMMENT '驳回原因',
    audit_comment VARCHAR(255) COMMENT '审核备注',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    audited_at TIMESTAMP NULL COMMENT '审核时间',
    FOREIGN KEY (applicant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (auditor_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_target (target_type, target_id),
    INDEX idx_status (status),
    INDEX idx_applicant_id (applicant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核记录表';

-- ----------------------------
-- 9. 留言表 (messages)
-- ----------------------------
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '留言ID',
    user_id INT NOT NULL COMMENT '留言用户ID',
    target_type ENUM('user', 'product', 'order', 'system') NOT NULL COMMENT '留言对象类型',
    target_id INT COMMENT '留言对象ID',
    content TEXT NOT NULL COMMENT '留言内容',
    parent_id INT NULL COMMENT '父留言ID(回复用)',
    status ENUM('normal', 'hidden', 'deleted') DEFAULT 'normal' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '留言时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    INDEX idx_target (target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言表';

-- ----------------------------
-- 10. 收藏表 (favorites)
-- ----------------------------
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    user_id INT NOT NULL COMMENT '用户ID',
    product_id INT NOT NULL COMMENT '商品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ============================================
-- 商品网上交易系统 测试数据填充脚本
-- 版本: V1.0
-- 创建日期: 2026-05-04
-- 描述: 插入测试数据用于开发调试
-- ============================================

USE online_shopping;

-- ----------------------------
-- 插入管理员账号 (密码: admin123)
-- ----------------------------
INSERT INTO users (username, password, email, phone, role, status, real_name) VALUES
('admin', '$2a$10$K9U.UNZSwMCHntpHMl7TQ.Gr6xwm9X0/m.uRcE7dCEX1Oui69Zmcm', 'admin@shop.com', '13800000000', 'admin', 'active', '系统管理员');

-- ----------------------------
-- 插入分类数据
-- ----------------------------
INSERT INTO categories (category_name, parent_id, sort_order) VALUES
('食品饮料', NULL, 1),
('服装鞋包', NULL, 2),
('数码电子', NULL, 3),
('家居用品', NULL, 4),
('图书音像', NULL, 5);

-- 子分类
INSERT INTO categories (category_name, parent_id, sort_order) VALUES
('零食坚果', 1, 1),
('饮料茶水', 1, 2),
('生鲜水果', 1, 3),
('男装', 2, 1),
('女装', 2, 2),
('鞋履', 2, 3),
('箱包', 2, 4),
('手机通讯', 3, 1),
('电脑办公', 3, 2),
('智能设备', 3, 3),
('家具', 4, 1),
('厨具', 4, 2),
('书籍', 5, 1),
('音乐', 5, 2);

-- ----------------------------
-- 插入卖家账号 (密码: seller123)
-- ----------------------------
INSERT INTO users (username, password, email, phone, role, status, real_name, id_card) VALUES
('seller001', '$2a$10$GtXgPdCy0DzMTGAFn/D9mOXHvy826gDRsU2QuK2jBy/lxibovOWTu', 'seller1@shop.com', '13800000001', 'seller', 'approved', '张三', '110101199001011234'),
('seller002', '$2a$10$GtXgPdCy0DzMTGAFn/D9mOXHvy826gDRsU2QuK2jBy/lxibovOWTu', 'seller2@shop.com', '13800000002', 'seller', 'approved', '李四', '110101199002021234'),
('seller003', '$2a$10$GtXgPdCy0DzMTGAFn/D9mOXHvy826gDRsU2QuK2jBy/lxibovOWTu', 'seller3@shop.com', '13800000003', 'seller', 'pending', '王五', '110101199003031234');

-- ----------------------------
-- 插入买家账号 (密码: buyer123)
-- ----------------------------
INSERT INTO users (username, password, email, phone, role, status, real_name) VALUES
('buyer001', '$2a$10$xr6LDvbeeL1mKHKebc40leyQz1CVjqClyiqDaPJbvgtQ0mkq3mDqK', 'buyer1@shop.com', '13900000001', 'buyer', 'active', '赵六'),
('buyer002', '$2a$10$xr6LDvbeeL1mKHKebc40leyQz1CVjqClyiqDaPJbvgtQ0mkq3mDqK', 'buyer2@shop.com', '13900000002', 'buyer', 'active', '钱七'),
('buyer003', '$2a$10$xr6LDvbeeL1mKHKebc40leyQz1CVjqClyiqDaPJbvgtQ0mkq3mDqK', 'buyer3@shop.com', '13900000003', 'buyer', 'pending', '孙八');

-- ----------------------------
-- 插入收货地址
-- ----------------------------
INSERT INTO addresses (user_id, receiver_name, phone, province, city, district, detail_address, postal_code, is_default) VALUES
(4, '赵六', '13900000001', '北京市', '北京市', '朝阳区', '建国路88号1号楼1001', '100022', TRUE),
(4, '赵六', '13900000001', '北京市', '北京市', '海淀区', '中关村大街1号', '100190', FALSE),
(5, '钱七', '13900000002', '上海市', '上海市', '浦东新区', '世纪大道100号', '200120', TRUE);

-- ----------------------------
-- 插入商品数据
-- ----------------------------
INSERT INTO products (seller_id, category_id, product_name, description, price, stock, unit, image_url, status, view_count, sales_count) VALUES
-- 零食坚果类 (category_id = 6)
(2, 6, '进口混合坚果礼盒', '精选美国碧根果、开心果，腰果等多种坚果，营养健康，精美礼盒包装', 128.00, 200, '盒', '/images/product_nuts.jpg', 'onsale', 520, 45),
(2, 6, '云南特产鲜花饼', '云南正宗鲜花饼，玫瑰花瓣入馅，香甜软糯，传统工艺制作', 29.90, 500, '袋', '/images/product_flower_cake.jpg', 'onsale', 380, 120),
(3, 6, '日式抹茶小圆饼', '日本风味抹茶小圆饼，酥脆可口，茶香浓郁，独立小包装', 19.90, 300, '包', '/images/product_matcha.jpg', 'onsale', 200, 35),

-- 饮料茶水类 (category_id = 7)
(2, 7, '武夷山金骏眉红茶', '正宗武夷山金骏眉，蜜香浓郁，回甘持久，50g罐装', 168.00, 100, '罐', '/images/product_tea.jpg', 'onsale', 280, 28),
(3, 7, '印尼进口猫屎咖啡', '麝香猫咖啡豆，独特风味，限量发售，100g袋装', 299.00, 50, '袋', '/images/product_coffee.jpg', 'onsale', 150, 12),

-- 生鲜水果类 (category_id = 8)
(2, 8, '智利进口车厘子', '智利JJ级车厘子，新鲜空运，个大饱满，2斤装', 168.00, 80, '箱', '/images/product_cherry.jpg', 'onsale', 650, 95),
(3, 8, '四川爱媛38号果冻橙', '四川眉山特产果冻橙，皮薄多汁，入口即化，5斤装', 45.00, 150, '箱', '/images/product_orange.jpg', 'onsale', 420, 78),

-- 服装类 (category_id = 9, 10)
(2, 9, '纯棉商务男士衬衫', '100%纯棉面料，透气舒适，经典款式，多色可选', 159.00, 120, '件', '/images/product_shirt.jpg', 'onsale', 300, 42),
(2, 10, '韩版修身女士风衣', '时尚韩版设计，优质面料，优雅百搭，春秋必备', 299.00, 80, '件', '/images/product_coat.jpg', 'onsale', 250, 38),
(3, 10, '复古港风连衣裙', '2024新款港风复古设计，高腰显瘦，适合多种场合', 199.00, 60, '件', '/images/product_dress.jpg', 'onsale', 180, 25),

-- 鞋履类 (category_id = 11)
(2, 11, '真皮男士商务皮鞋', '头层牛皮，透气内里，简约商务款式，舒适耐磨', 328.00, 90, '双', '/images/product_men_shoes.jpg', 'onsale', 220, 30),
(3, 11, '时尚女士细高跟单鞋', '简约时尚设计，优雅气质，舒适鞋跟，日常通勤必备', 258.00, 100, '双', '/images/product_women_shoes.jpg', 'onsale', 350, 55),

-- 手机通讯 (category_id = 12)
(2, 12, '蓝牙耳机无线耳机', '入耳式设计，降噪功能，超长续航，兼容苹果安卓', 199.00, 200, '副', '/images/product_earphone.jpg', 'onsale', 800, 156),
(3, 12, '数据线快充线', 'Type-C快充线，充电传输二合一，编织线材耐用', 29.90, 1000, '条', '/images/product_cable.jpg', 'onsale', 1200, 320),

-- 电脑办公 (category_id = 13)
(2, 13, '无线蓝牙键盘鼠标套装', '静音按键，人体工学设计，支持多设备切换', 139.00, 150, '套', '/images/product_keyboard.jpg', 'onsale', 420, 68),

-- 家居家具 (category_id = 14)
(2, 14, '北欧简约实木书桌', '进口白蜡木，环保水性漆，1.2m/1.4m可选', 899.00, 30, '张', '/images/product_desk.jpg', 'onsale', 180, 15),
(3, 14, '轻奢岩板茶几', '岩板台面+金属框架，现代简约风格，时尚大气', 699.00, 40, '张', '/images/product_coffee_table.jpg', 'onsale', 120, 8),

-- 厨具 (category_id = 15)
(2, 15, '德国进口不粘炒锅', '304不锈钢，蜂窝不粘设计，少油烟，32cm', 368.00, 60, '口', '/images/product_wok.jpg', 'onsale', 280, 35),
(3, 15, '日式陶瓷餐具套装', '釉下彩工艺，健康环保，16件套礼盒装', 258.00, 80, '套', '/images/product_dishes.jpg', 'onsale', 190, 22),

-- 书籍 (category_id = 16)
(2, 16, 'JavaScript高级程序设计', '前端开发经典教材，涵盖ES6+新特性，权威指南', 89.00, 200, '本', '/images/product_js_book.jpg', 'onsale', 550, 88),
(2, 16, '深入理解计算机系统', 'CSAPP原书第3版，计算机科学经典著作',  139.00, 100, '本', '/images/product_cs_book.jpg', 'onsale', 380, 45);

-- ----------------------------
-- 插入购物车数据
-- ----------------------------
INSERT INTO cart (user_id, product_id, quantity) VALUES
(4, 1, 2),
(4, 6, 1),
(4, 12, 3),
(5, 2, 1),
(5, 8, 2),
(5, 14, 1);

-- ----------------------------
-- 插入订单数据
-- ----------------------------
-- 订单1: 已完成
INSERT INTO orders (order_no, buyer_id, address_id, total_amount, status, payment_method, payment_time, shipping_time, received_time) VALUES
('ORD202605010001', 4, 1, 465.90, 'completed', 'alipay', '2026-05-01 10:30:00', '2026-05-01 15:00:00', '2026-05-03 09:00:00');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES
(1, 1, '进口混合坚果礼盒', '/images/product_nuts.jpg', 128.00, 2, 256.00),
(1, 6, '智利进口车厘子', '/images/product_cherry.jpg', 168.00, 1, 168.00),
(1, 12, '蓝牙耳机无线耳机', '/images/product_earphone.jpg', 199.00, 1, 199.00);

-- 订单2: 已发货
INSERT INTO orders (order_no, buyer_id, address_id, total_amount, status, payment_method, payment_time, shipping_time) VALUES
('ORD202605020001', 4, 1, 299.00, 'shipped', 'wechat', '2026-05-02 14:20:00', '2026-05-02 18:00:00');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES
(2, 9, '韩版修身女士风衣', '/images/product_coat.jpg', 299.00, 1, 299.00);

-- 订单3: 待支付
INSERT INTO orders (order_no, buyer_id, address_id, total_amount, status, buyer_message) VALUES
('ORD202605030001', 5, 3, 413.90, 'pending_payment', '请尽快发货');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES
(3, 2, '云南特产鲜花饼', '/images/product_flower_cake.jpg', 29.90, 3, 89.70),
(3, 7, '武夷山金骏眉红茶', '/images/product_tea.jpg', 168.00, 1, 168.00),
(3, 15, '真皮男士商务皮鞋', '/images/product_men_shoes.jpg', 328.00, 1, 328.00);

-- ----------------------------
-- 插入审核记录
-- ----------------------------
-- 卖家注册审核
INSERT INTO audits (audit_type, target_type, target_id, applicant_id, auditor_id, status, audit_comment, submitted_at, audited_at) VALUES
('user_register', 'user', 3, 3, 1, 'pending', NULL, '2026-05-03 09:00:00', NULL);

-- 已完成的审核记录
INSERT INTO audits (audit_type, target_type, target_id, applicant_id, auditor_id, status, audit_comment, submitted_at, audited_at) VALUES
('user_register', 'user', 2, 2, 1, 'approved', '资质审核通过', '2026-04-15 10:00:00', '2026-04-15 14:30:00'),
('user_register', 'user', 3, 3, 1, 'approved', '资质审核通过', '2026-04-16 11:00:00', '2026-04-16 15:00:00');

-- 商品审核
INSERT INTO audits (audit_type, target_type, target_id, applicant_id, auditor_id, status, audit_comment, submitted_at, audited_at) VALUES
('product_publish', 'product', 1, 2, 1, 'approved', '商品信息完整，通过', '2026-04-20 09:00:00', '2026-04-20 10:30:00'),
('product_publish', 'product', 2, 2, 1, 'approved', '商品信息完整，通过', '2026-04-20 09:30:00', '2026-04-20 10:35:00'),
('product_publish', 'product', 22, 2, 1, 'approved', '上架审核通过', '2026-05-01 14:00:00', '2026-05-01 16:00:00');

-- ----------------------------
-- 插入留言数据
-- ----------------------------
INSERT INTO messages (user_id, target_type, target_id, content, parent_id, status) VALUES
(4, 'product', 1, '这个坚果礼盒包装精美吗？送礼合适吗？', NULL, 'normal'),
(2, 'product', 1, '您好，这款礼盒包装精美，配有高档礼袋，非常适合送礼。', 1, 'normal'),
(5, 'product', 6, '车厘子新鲜吗？什么时候到货？', NULL, 'normal'),
(4, 'order', 1, '订单已收到，商品完好无损，物流很快！', NULL, 'normal'),
(4, 'system', NULL, '系统测试留言', NULL, 'normal');

-- ----------------------------
-- 插入收藏数据
-- ----------------------------
INSERT INTO favorites (user_id, product_id) VALUES
(4, 1),
(4, 6),
(4, 9),
(4, 15),
(5, 2),
(5, 7),
(5, 14),
(5, 16);

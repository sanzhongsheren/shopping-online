const db = require("../config/db");

// 创建订单（事务：检查库存 + 扣减库存 + 创建订单 + 明细）
async function createOrder(buyerId, addressId, paymentMethod, items) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 计算总金额，并验证库存
    let totalAmount = 0;
    for (const item of items) {
      const [productRows] = await conn.execute(
        "SELECT product_id, price, stock, status FROM products WHERE product_id = ? FOR UPDATE",
        [item.productId]
      );
      if (productRows.length === 0) {
        throw new Error(`商品 ${item.productId} 不存在`);
      }
      const product = productRows[0];
      if (product.status !== 'onsale') {
        throw new Error(`商品 ${item.productId} 已下架或未上架`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`商品 ${item.productId} 库存不足`);
      }
      // 扣减库存
      await conn.execute(
        "UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE product_id = ?",
        [item.quantity, item.quantity, item.productId]
      );
      totalAmount += product.price * item.quantity;
    }

    // 生成订单号
    const orderNo = "ORD" + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

    // 插入订单主表
    const orderSql = `
      INSERT INTO orders (order_no, buyer_id, address_id, total_amount, status, payment_method)
      VALUES (?, ?, ?, ?, 'pending_payment', ?)
    `;
    const [orderResult] = await conn.execute(orderSql, [orderNo, buyerId, addressId, totalAmount, paymentMethod]);
    const orderId = orderResult.insertId;

    // 插入订单明细（快照）
    for (const item of items) {
      const [prod] = await conn.execute(
        "SELECT product_name, image_url, price FROM products WHERE product_id = ?",
        [item.productId]
      );
      const p = prod[0];
      const subtotal = p.price * item.quantity;
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, p.product_name, p.image_url, p.price, item.quantity, subtotal]
      );
    }

    await conn.commit();
    return { orderId, orderNo, totalAmount };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 根据买家ID查询订单列表
async function getOrdersByBuyer(buyerId) {
  const sql = `
    SELECT o.order_id, o.order_no, o.total_amount, o.status, o.payment_method,
           o.created_at, o.payment_time, o.shipping_time, o.received_time
    FROM orders o
    WHERE o.buyer_id = ?
    ORDER BY o.created_at DESC
  `;
  const [rows] = await db.query(sql, [buyerId]);
  return rows;
}

// 根据卖家ID查询与自己商品相关的订单明细（略复杂，可暂时简化）
// 这个项目里暂时可让卖家在订单管理里看到购买了ta商品的订单
async function getOrdersBySeller(sellerId) {
  const sql = `
    SELECT o.order_id, o.order_no, o.total_amount, o.status, o.created_at,
           oi.product_name, oi.quantity, oi.subtotal
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE p.seller_id = ?
    ORDER BY o.created_at DESC
  `;
  const [rows] = await db.query(sql, [sellerId]);
  return rows;
}

// 根据订单ID获取详情
async function getOrderById(orderId) {
  const orderSql = "SELECT * FROM orders WHERE order_id = ?";
  const [orderRows] = await db.query(orderSql, [orderId]);
  if (orderRows.length === 0) return null;
  const order = orderRows[0];

  const itemsSql = "SELECT * FROM order_items WHERE order_id = ?";
  const [items] = await db.query(itemsSql, [orderId]);
  order.items = items;
  return order;
}

/**
 * 订单付款（买家）
 */
async function payOrder(orderId, buyerId) {
    // 简易：直接改状态，实际应调支付接口
    const sql = "UPDATE orders SET status = 'paid', payment_time = NOW() WHERE order_id = ? AND buyer_id = ? AND status = 'pending_payment'";
    const [result] = await db.query(sql, [orderId, buyerId]);
    return result.affectedRows;
  }
  
  /**
   * 卖家发货
   */
  async function shipOrder(orderId, sellerId) {
    // 简易：任何卖家都能发货，实际应校验订单中商品属于该卖家
    const sql = `
      UPDATE orders o
      SET o.status = 'shipped', o.shipping_time = NOW()
      WHERE o.order_id = ? AND o.status = 'paid'
        AND EXISTS (
          SELECT 1 FROM order_items oi JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = o.order_id AND p.seller_id = ?
        )
    `;
    const [result] = await db.query(sql, [orderId, sellerId]);
    return result.affectedRows;
  }
  
  /**
   * 买家确认收货
   */
  async function confirmReceive(orderId, buyerId) {
    const sql = "UPDATE orders SET status = 'received', received_time = NOW() WHERE order_id = ? AND buyer_id = ? AND status = 'shipped'";
    const [result] = await db.query(sql, [orderId, buyerId]);
    return result.affectedRows;
  }
  
  /**
   * 取消订单（买家或卖家，并恢复库存）
   */
  async function cancelOrder(orderId, userId, reason) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
  
      // 检查订单状态，只允许 pending_payment 或 paid 状态取消
      const [orders] = await conn.query(
        "SELECT * FROM orders WHERE order_id = ? AND (buyer_id = ? OR EXISTS (SELECT 1 FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = orders.order_id AND p.seller_id = ?))",
        [orderId, userId, userId]
      );
      if (!orders.length) throw new Error("订单不存在或无权操作");
  
      const order = orders[0];
      if (!['pending_payment', 'paid'].includes(order.status)) {
        throw new Error("该订单状态无法取消");
      }
  
      // 恢复库存
      const [items] = await conn.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);
      for (const item of items) {
        await conn.query("UPDATE products SET stock = stock + ? WHERE product_id = ?", [item.quantity, item.product_id]);
      }
  
      // 更新订单状态
      await conn.query("UPDATE orders SET status = 'cancelled', cancel_time = NOW(), cancel_reason = ? WHERE order_id = ?", [reason || '无', orderId]);
  
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  module.exports = {
    createOrder,
    getOrdersByBuyer,
    getOrdersBySeller,
    getOrderById,
    payOrder,
    shipOrder,
    confirmReceive,
    cancelOrder
  };
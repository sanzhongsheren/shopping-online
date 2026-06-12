const db = require("../config/db");

async function getCartByUserId(userId) {
  const sql = `
    SELECT c.cart_id, c.product_id, c.quantity,
           p.product_name, p.price, p.image_url, p.stock, p.status
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;
  const [rows] = await db.query(sql, [userId]);
  return rows;
}

async function addToCart(userId, productId, quantity) {
  const sql = `
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;
  const [result] = await db.query(sql, [userId, productId, quantity]);
  return result.insertId;
}

async function updateCartItem(cartId, userId, quantity) {
  const sql = "UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?";
  const [result] = await db.query(sql, [quantity, cartId, userId]);
  return result.affectedRows;
}

async function removeCartItem(cartId, userId) {
  const sql = "DELETE FROM cart WHERE cart_id = ? AND user_id = ?";
  const [result] = await db.query(sql, [cartId, userId]);
  return result.affectedRows;
}

async function clearCart(userId) {
  const sql = "DELETE FROM cart WHERE user_id = ?";
  const [result] = await db.query(sql, [userId]);
  return result.affectedRows;
}

module.exports = {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

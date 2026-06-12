const db = require("../config/db");

async function getFavoritesByUserId(userId) {
  const sql = `
    SELECT f.favorite_id, f.product_id, f.created_at,
           p.product_name, p.price, p.image_url, p.status
    FROM favorites f
    JOIN products p ON f.product_id = p.product_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;
  const [rows] = await db.query(sql, [userId]);
  return rows;
}

async function addFavorite(userId, productId) {
  const sql = "INSERT INTO favorites (user_id, product_id) VALUES (?, ?)";
  const [result] = await db.query(sql, [userId, productId]);
  return result.insertId;
}

async function removeFavorite(userId, productId) {
  const sql = "DELETE FROM favorites WHERE user_id = ? AND product_id = ?";
  const [result] = await db.query(sql, [userId, productId]);
  return result.affectedRows;
}

async function checkFavorite(userId, productId) {
  const sql = "SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?";
  const [rows] = await db.query(sql, [userId, productId]);
  return rows.length > 0;
}

module.exports = {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite,
  checkFavorite
};

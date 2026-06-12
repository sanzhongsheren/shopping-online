const db = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser({ username, password, email, phone, role }) {
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 买家直接 active，卖家需要审核 (pending)
  const status = role === "seller" ? "pending" : "active";
  
  const sql = `
    INSERT INTO users (username, password, email, phone, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [username, hashedPassword, email, phone, role, status]);
  return result.insertId;
}

async function findByUsername(username) {
  const sql = "SELECT * FROM users WHERE username = ?";
  const [rows] = await db.query(sql, [username]);
  return rows[0];
}

async function findById(userId) {
  const sql = "SELECT user_id, username, email, phone, role, status, real_name, avatar_url, created_at FROM users WHERE user_id = ?";
  const [rows] = await db.query(sql, [userId]);
  return rows[0];
}

async function updateStatus(userId, status) {
  const sql = "UPDATE users SET status = ? WHERE user_id = ?";
  await db.query(sql, [status, userId]);
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  updateStatus
};
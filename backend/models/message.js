const db = require("../config/db");

async function getMessages({ targetType, targetId, userId }) {
  let sql = `
    SELECT m.*, u.username
    FROM messages m
    JOIN users u ON m.user_id = u.user_id
    WHERE m.status = 'normal'
  `;
  const params = [];
  if (targetType) {
    sql += " AND m.target_type = ?";
    params.push(targetType);
  }
  if (targetId) {
    sql += " AND m.target_id = ?";
    params.push(targetId);
  }
  if (userId) {
    sql += " AND (m.user_id = ? OR m.target_type != 'user' OR (m.target_type = 'user' AND m.target_id = ?))";
    params.push(userId, userId);
  }
  sql += " ORDER BY m.created_at DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createMessage({ userId, targetType, targetId, content, parentId }) {
  const sql = `
    INSERT INTO messages (user_id, target_type, target_id, content, parent_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [userId, targetType, targetId, content, parentId || null]);
  return result.insertId;
}

async function deleteMessage(messageId, userId) {
  const sql = "UPDATE messages SET status = 'deleted' WHERE message_id = ? AND user_id = ?";
  const [result] = await db.query(sql, [messageId, userId]);
  return result.affectedRows;
}

module.exports = {
  getMessages,
  createMessage,
  deleteMessage
};

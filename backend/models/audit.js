const db = require("../config/db");

async function createAudit(auditType, targetType, targetId, applicantId) {
  const sql = `
    INSERT INTO audits (audit_type, target_type, target_id, applicant_id, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;
  const [result] = await db.query(sql, [auditType, targetType, targetId, applicantId]);
  return result.insertId;
}

async function getPendingAudits() {
  const sql = `
    SELECT a.*, 
           u.username AS applicant_name,
           CASE 
             WHEN a.target_type = 'user' THEN (SELECT username FROM users WHERE user_id = a.target_id)
             WHEN a.target_type = 'product' THEN (SELECT product_name FROM products WHERE product_id = a.target_id)
             ELSE NULL 
           END AS target_name
    FROM audits a
    JOIN users u ON a.applicant_id = u.user_id
    WHERE a.status = 'pending'
    ORDER BY a.submitted_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

async function processAudit(auditId, status, auditorId, rejectReason = null) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 更新审核记录
    await conn.execute(
      "UPDATE audits SET status = ?, auditor_id = ?, audited_at = NOW(), reject_reason = ? WHERE audit_id = ?",
      [status, auditorId, rejectReason, auditId]
    );

    // 根据目标类型更新对应的实体状态
    const [auditRows] = await conn.execute(
      "SELECT * FROM audits WHERE audit_id = ?",
      [auditId]
    );
    const audit = auditRows[0];

    if (audit.target_type === 'user') {
      const userStatus = status === 'approved' ? 'active' : 'rejected';
      await conn.execute("UPDATE users SET status = ? WHERE user_id = ?", [userStatus, audit.target_id]);
    } else if (audit.target_type === 'product') {
      const productStatus = status === 'approved' ? 'onsale' : 'rejected';
      await conn.execute("UPDATE products SET status = ? WHERE product_id = ?", [productStatus, audit.target_id]);
    }

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
  createAudit,
  getPendingAudits,
  processAudit
};
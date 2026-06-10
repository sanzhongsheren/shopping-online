const db = require("../config/db");

async function getAddressesByUserId(userId) {
  const sql = "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC";
  const [rows] = await db.query(sql, [userId]);
  return rows;
}

async function createAddress({ userId, receiverName, phone, province, city, district, detailAddress, isDefault }) {
  if (isDefault) {
    await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  }
  const sql = `
    INSERT INTO addresses (user_id, receiver_name, phone, province, city, district, detail_address, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [userId, receiverName, phone, province, city, district, detailAddress, isDefault || false]);
  return result.insertId;
}

async function updateAddress(addressId, userId, { receiverName, phone, province, city, district, detailAddress, isDefault }) {
  if (isDefault) {
    await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  }
  const sql = `
    UPDATE addresses SET receiver_name = ?, phone = ?, province = ?, city = ?, district = ?, detail_address = ?, is_default = ?
    WHERE address_id = ? AND user_id = ?
  `;
  const [result] = await db.query(sql, [receiverName, phone, province, city, district, detailAddress, isDefault || false, addressId, userId]);
  return result.affectedRows;
}

async function deleteAddress(addressId, userId) {
  const sql = "DELETE FROM addresses WHERE address_id = ? AND user_id = ?";
  const [result] = await db.query(sql, [addressId, userId]);
  return result.affectedRows;
}

module.exports = {
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress
};

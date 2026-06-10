const db = require("../config/db");

async function getProductList(options = {}) {
  const page = Number(options.page) || 1;
  const pageSize = Number(options.pageSize) || 10;
  const categoryId = options.categoryId ? Number(options.categoryId) : null;
  const keyword = options.keyword ? String(options.keyword) : null;
  const sort = options.sort || 'default';

  let whereClause = "WHERE p.status = 'onsale'";
  const filterParams = [];

  if (categoryId) {
    whereClause += " AND p.category_id IN (SELECT category_id FROM categories WHERE parent_id = ? OR category_id = ?)";
    filterParams.push(categoryId, categoryId);
  }
  if (keyword) {
    whereClause += " AND p.product_name LIKE ?";
    filterParams.push(`%${keyword}%`);
  }

  // 排序映射
  const sortMap = {
    default: 'p.updated_at DESC',
    sales: 'p.sales_count DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
  };
  const orderBy = sortMap[sort] || 'p.updated_at DESC';

  // 总条数查询
  const countSql = `SELECT COUNT(*) AS total FROM products p ${whereClause}`;
  const [countRows] = filterParams.length
    ? await db.query(countSql, filterParams)
    : await db.query(countSql);
  const total = countRows[0].total;

  // 主查询
  const sql = `
    SELECT
      p.product_id, p.product_name, p.price, p.stock, p.unit,
      p.image_url, p.sales_count, p.view_count, p.status,
      u.username AS seller_name, u.user_id AS seller_id
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.user_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ?, ?
  `;
  const offset = (page - 1) * pageSize;
  const queryParams = [...filterParams, offset, pageSize];
  const [rows] = await db.query(sql, queryParams);

  return {
    list: rows,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
}

async function getProductById(productId) {
  const sql = `
    SELECT p.*, u.username AS seller_name
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.user_id
    WHERE p.product_id = ?
  `;
  const [rows] = await db.query(sql, [productId]);
  return rows[0];
}

async function createProduct({ sellerId, categoryId, productName, description, price, stock, imageUrl }) {
  const sql = `
    INSERT INTO products (seller_id, category_id, product_name, description, price, stock, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  const [result] = await db.query(sql, [sellerId, categoryId, productName, description, price, stock, imageUrl || null]);
  return result.insertId;
}

async function updateProduct(productId, sellerId, { productName, description, price, stock, categoryId, imageUrl }) {
  const sql = `
    UPDATE products
    SET product_name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?
    WHERE product_id = ? AND seller_id = ? AND status != 'deleted'
  `;
  const [result] = await db.query(sql, [productName, description, price, stock, categoryId, imageUrl || null, productId, sellerId]);
  return result.affectedRows;
}

async function deleteProduct(productId, sellerId) {
  const sql = "UPDATE products SET status = 'offsale' WHERE product_id = ? AND seller_id = ?";
  const [result] = await db.query(sql, [productId, sellerId]);
  return result.affectedRows;
}

async function approveProduct(productId, status) {
  const sql = "UPDATE products SET status = ? WHERE product_id = ?";
  const [result] = await db.query(sql, [status, productId]);
  return result.affectedRows;
}

module.exports = {
  getProductList,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct
};
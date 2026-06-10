const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",  // 留空，要求通过环境变量设置
  database: process.env.DB_NAME || "online_shopping",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4"  // 明确指定字符集，与建表一致
});

// 简单的连接测试（可选，用于启动时检查）
pool.getConnection()
  .then(conn => {
    console.log("✅ 数据库连接成功!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ 数据库连接失败:", err.message);
  });

module.exports = pool;
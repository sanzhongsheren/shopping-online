require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接测试
require("./config/db");

// 路由挂载
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/users"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/favorites", require("./routes/favorites"));

// 托管前端静态文件
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: "服务器内部错误" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// 公开接口
router.get("/", productController.getProductList);
router.get("/:id", productController.getProductDetail);

// 卖家接口（需要登录并具有 seller 角色）
router.post("/", authenticate, authorizeRoles("seller"), productController.createProduct);
router.put("/:id", authenticate, authorizeRoles("seller"), productController.updateProduct);
router.delete("/:id", authenticate, authorizeRoles("seller"), productController.deleteProduct);

// 管理员审核商品（需要登录并具有 admin 角色）
router.put("/:id/approve", authenticate, authorizeRoles("admin"), productController.approveProduct);

module.exports = router;
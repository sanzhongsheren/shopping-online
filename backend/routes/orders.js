const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// 买家
router.post("/", authenticate, authorizeRoles("buyer"), orderController.createOrder);
router.get("/my", authenticate, authorizeRoles("buyer"), orderController.getMyOrders);

// 卖家
router.get("/seller", authenticate, authorizeRoles("seller"), orderController.getSellerOrders);

// 订单详情（登录可见，可扩展权限）
router.get("/:id", authenticate, orderController.getOrderDetail);

router.put("/:id/pay", authenticate, authorizeRoles("buyer"), orderController.payOrder);
router.put("/:id/ship", authenticate, authorizeRoles("seller"), orderController.shipOrder);
router.put("/:id/receive", authenticate, authorizeRoles("buyer"), orderController.confirmReceive);
router.put("/:id/cancel", authenticate, orderController.cancelOrder); // 买卖家均可
module.exports = router;
const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// 卖家或买家提交审核（比如卖家注册时自动触发，或商品创建时调用）
router.post("/submit", authenticate, authorizeRoles("seller", "buyer"), auditController.submitAudit);

// 管理员接口
router.get("/pending", authenticate, authorizeRoles("admin"), auditController.getPendingList);
router.put("/process", authenticate, authorizeRoles("admin"), auditController.processAudit);

module.exports = router;
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

// 公开接口
router.post("/register", userController.register);
router.post("/login", userController.login);

// 需要登录的接口
router.get("/profile", authenticate, userController.getProfile);

module.exports = router;
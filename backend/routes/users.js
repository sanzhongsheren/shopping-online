const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const addressController = require("../controllers/addressController");
const { authenticate } = require("../middleware/auth");

// 公开接口
router.post("/register", userController.register);
router.post("/login", userController.login);

// 需要登录的接口
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);

// 地址管理
router.get("/addresses", authenticate, addressController.getAddresses);
router.post("/addresses", authenticate, addressController.addAddress);
router.put("/addresses/:id", authenticate, addressController.updateAddress);
router.delete("/addresses/:id", authenticate, addressController.deleteAddress);

module.exports = router;
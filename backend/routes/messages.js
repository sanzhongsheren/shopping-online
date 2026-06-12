const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { authenticate } = require("../middleware/auth");

router.get("/", messageController.getMessages);
router.post("/", authenticate, messageController.sendMessage);
router.delete("/:id", authenticate, messageController.deleteMessage);

module.exports = router;

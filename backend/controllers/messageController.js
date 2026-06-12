const Message = require("../models/message");
const { success, error, badRequest } = require("../utils/response");

exports.getMessages = async (req, res) => {
  try {
    const { target_type, target_id } = req.query;
    const messages = await Message.getMessages({
      targetType: target_type,
      targetId: target_id ? parseInt(target_id) : undefined,
      userId: req.user ? req.user.userId : undefined
    });
    success(res, { messages }, "留言列表获取成功");
  } catch (err) {
    console.error("获取留言失败:", err);
    error(res, "获取留言失败");
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { targetType, targetId, content, parentId } = req.body;
    if (!targetType || !content) {
      return badRequest(res, "缺少留言类型或内容");
    }
    const msgId = await Message.createMessage({
      userId: req.user.userId,
      targetType,
      targetId: targetId || null,
      content,
      parentId
    });
    success(res, { messageId: msgId }, "留言发送成功");
  } catch (err) {
    console.error("发送留言失败:", err);
    error(res, "发送留言失败");
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const affected = await Message.deleteMessage(messageId, req.user.userId);
    if (affected === 0) return badRequest(res, "留言不存在或无权删除");
    success(res, null, "留言已删除");
  } catch (err) {
    console.error("删除留言失败:", err);
    error(res, "删除留言失败");
  }
};

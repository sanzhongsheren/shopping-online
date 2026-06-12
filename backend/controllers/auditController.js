const Audit = require("../models/audit");
const { success, error, badRequest } = require("../utils/response");

// 提交审核（卖家注册审核或商品发布审核，由调用方传入参数）
exports.submitAudit = async (req, res) => {
  try {
    const { auditType, targetType, targetId } = req.body;
    if (!auditType || !targetType || !targetId) {
      return badRequest(res, "缺少必要参数");
    }
    const auditId = await Audit.createAudit(auditType, targetType, targetId, req.user.userId);
    success(res, { auditId }, "审核申请已提交");
  } catch (err) {
    console.error("提交审核失败:", err);
    error(res, "提交审核失败");
  }
};

// 管理员查看待审核列表
exports.getPendingList = async (req, res) => {
  try {
    const list = await Audit.getPendingAudits();
    success(res, { list }, "待审核列表获取成功");
  } catch (err) {
    console.error("获取待审核列表失败:", err);
    error(res, "获取待审核列表失败");
  }
};

// 管理员处理审核
exports.processAudit = async (req, res) => {
  try {
    const { auditId, status, rejectReason } = req.body; // status: approved / rejected
    if (!auditId || !status) {
      return badRequest(res, "缺少审核ID或状态");
    }
    await Audit.processAudit(auditId, status, req.user.userId, rejectReason);
    success(res, null, "审核处理完成");
  } catch (err) {
    console.error("审核处理失败:", err);
    error(res, "审核处理失败");
  }
};
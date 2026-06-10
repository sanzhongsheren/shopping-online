const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret, expiresIn } = require("../config/auth");
const { success, error, badRequest } = require("../utils/response");
const Audit = require("../models/audit");

// 注册
exports.register = async (req, res) => {
  try {
    const { username, password, email, phone, role } = req.body;
    
    // 简单校验
    if (!username || !password || !role) {
      return badRequest(res, "用户名、密码、角色为必填项");
    }
    if (!["buyer", "seller"].includes(role)) {
      return badRequest(res, "角色只能为 buyer 或 seller");
    }

    // 检查用户名是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return badRequest(res, "用户名已被注册");
    }

    const userId = await User.createUser({ username, password, email, phone, role });
    // 如果是卖家，自动提交审核
    if (role === 'seller') {
        await Audit.createAudit('user_register', 'user', userId, userId);
      }
    success(res, { userId }, "注册成功");
  } catch (err) {
    console.error("注册失败:", err);
    error(res, "注册失败，请稍后重试");
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return badRequest(res, "请输入用户名和密码");
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return badRequest(res, "用户名或密码错误");
    }

    // 检查账号状态
    if (user.status === "disabled") {
      return badRequest(res, "账号已被禁用");
    }
    if (user.status === "pending" || user.status === "rejected") {
      return badRequest(res, "账号还未审核通过，请等待");
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return badRequest(res, "用户名或密码错误");
    }

    // 生成 token
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn });

    success(res, {
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role
      }
    }, "登录成功");
  } catch (err) {
    console.error("登录失败:", err);
    error(res, "登录失败");
  }
};

// 获取当前用户信息（需要登录）
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return error(res, "用户不存在", 404);
    }
    success(res, { user }, "获取用户信息成功");
  } catch (err) {
    console.error("获取用户信息失败:", err);
    error(res, "获取用户信息失败");
  }
};
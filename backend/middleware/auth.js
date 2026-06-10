const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/auth");

// 验证 Token 中间件
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ code: 401, message: "未登录或身份凭证无效" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;   // 通常包含 userId, username, role
    next();
  } catch (err) {
    res.status(401).json({ code: 401, message: "身份凭证已过期或无效" });
  }
};

// 角色检查中间件（可传入多个允许的角色）
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: "权限不足" });
    }
    next();
  };
};
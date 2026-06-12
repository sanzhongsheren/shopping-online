module.exports = {
    jwtSecret: process.env.JWT_SECRET || "shopping_online_jwt_secret_key_2026",
    expiresIn: process.env.JWT_EXPIRES_IN || "365d"   // 原来是 "7d"，改成一年
  };
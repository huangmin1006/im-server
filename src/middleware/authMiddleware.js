const userService = require("../services/userService");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: "未提供认证token",
      });
    }

    // 处理 Bearer token 格式
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7) // 移除 'Bearer ' 前缀
      : authHeader; // 如果没有前缀，直接使用

    // 验证 token
    const decoded = userService.verifyToken(token);

    // 将用户信息添加到请求对象中
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: error.message || "认证失败",
    });
  }
};

module.exports = authMiddleware;

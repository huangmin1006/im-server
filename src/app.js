const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const userInfoRoutes = require("./routes/userInfoRoutes");

const app = express();
const port = process.env.PORT || 8888;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 路由配置
app.use("/api/users", userRoutes); // 用户相关路由
app.use("/api/auth", authRoutes); // 认证相关路由
app.use("/api/user", userInfoRoutes); // 用户信息路由

// 测试路由
app.get("/", (req, res) => {
  res.json({ message: "服务器运行正常" });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("错误详情:", err);
  res.status(500).json({
    code: 500,
    message: "服务器内部错误",
    error: err.message || err,
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const userService = require("../services/userService");

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydatabase",
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

class UserController {
  // 用户注册
  async register(req, res) {
    try {
      const userData = req.body;
      const result = await userService.register(userData);

      res.status(201).json({
        code: 200,
        message: "注册成功",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
      });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await userService.login(username, password);
      res.json({
        code: 200,
        message: "登录成功",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
      });
    }
  }

  // 退出登录
  async logout(req, res) {
    try {
      const userId = req.user.id; // 从请求中获取用户ID
      await userService.logout(userId);
      res.json({
        code: 200,
        message: "退出登录成功",
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
      });
    }
  }

  // 获取用户信息
  async getUserInfo(req, res) {
    try {
      const userId = req.user.id; // 从请求中获取用户ID
      const userInfo = await userService.getUserInfo(userId);
      res.json({
        code: 200,
        message: "获取用户信息成功",
        data: userInfo,
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
      });
    }
  }

  // 获取用户详细信息
  async getUserDetailInfo(req, res) {
    try {
      const userId = req.user.id;
      const userInfo = await userService.getUserDetailInfo(userId);
      res.json({
        code: 200,
        message: "获取用户详细信息成功",
        data: {
          roles: userInfo.roles,
          realName: userInfo.realName,
        },
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
      });
    }
  }

  // 获取用户列表
  async getUserList(req, res) {
    try {
      // 从查询参数中获取并验证数据
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const username = req.query.username || "";
      const email = req.query.email || "";
      const phone = req.query.phone || "";
      const status =
        req.query.status !== undefined ? parseInt(req.query.status) : undefined;

      // 构建过滤条件
      const filters = {
        username: username || undefined,
        email: email || undefined,
        phone: phone || undefined,
        status: status,
      };

      const result = await userService.getUserList(page, pageSize, filters);

      res.json({
        code: 200,
        data: result,
        message: "获取用户列表成功",
      });
    } catch (error) {
      console.error("获取用户列表失败:", error);
      res.status(500).json({
        code: 500,
        message: error.message || "获取用户列表失败",
      });
    }
  }
}

module.exports = new UserController();

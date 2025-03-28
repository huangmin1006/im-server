const express = require("express");
const router = express.Router();
const pool = require("../db");

// 用户注册
router.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "用户名已存在",
      });
    }

    // 创建新用户
    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );

    res.json({
      success: true,
      message: "注册成功",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

// 删除用户
router.delete("/api/users/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "用户删除成功",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }
  } catch (error) {
    console.error("删除用户错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

// 获取用户列表（支持分页和关键字搜索）
router.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || "";
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    let whereClause = "";
    let queryParams = [];

    if (keyword) {
      whereClause = "WHERE username LIKE ?";
      queryParams = [`%${keyword}%`];
    }

    // 获取总记录数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 获取分页数据
    const [users] = await pool.query(
      `SELECT id, username, created_at 
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    res.json({
      success: true,
      data: {
        list: users,
        pagination: {
          current: page,
          pageSize: pageSize,
          total: total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("获取用户列表错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

// 获取单个用户信息
router.get("/api/users/:id", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, created_at FROM users WHERE id = ?",
      [req.params.id]
    );

    if (users.length > 0) {
      res.json({
        success: true,
        data: users[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

module.exports = router;

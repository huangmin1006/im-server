const express = require("express");
const router = express.Router();
const pool = require("../db");
const { body, validationResult } = require("express-validator");

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
      whereClause = "WHERE username LIKE ? OR nickname LIKE ? OR email LIKE ?";
      queryParams = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];
    }

    // 获取总记录数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 获取分页数据
    const [users] = await pool.query(
      `SELECT id, username, nickname, avatar, gender, birthday,
              phone, email, last_login_time, account_status,
              unread_message_count, user_role, language_preference,
              created_at, updated_at
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
      `SELECT id, username, nickname, avatar, gender, birthday,
              phone, email, last_login_time, account_status,
              unread_message_count, user_role, language_preference,
              created_at, updated_at
       FROM users WHERE id = ?`,
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

// 更新用户信息
router.put(
  "/api/users/:id",
  [
    body("nickname").optional().trim().isLength({ max: 50 }),
    body("avatar").optional().isURL(),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("birthday").optional().isDate(),
    body("language_preference").optional().isIn(["zh-CN", "en-US"]),
  ],
  async (req, res) => {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "输入数据验证失败",
          errors: errors.array(),
        });
      }

      const { nickname, avatar, gender, birthday, language_preference } =
        req.body;
      const userId = req.params.id;

      // 构建更新字段
      const updateFields = [];
      const updateValues = [];

      if (nickname !== undefined) {
        updateFields.push("nickname = ?");
        updateValues.push(nickname);
      }
      if (avatar !== undefined) {
        updateFields.push("avatar = ?");
        updateValues.push(avatar);
      }
      if (gender !== undefined) {
        updateFields.push("gender = ?");
        updateValues.push(gender);
      }
      if (birthday !== undefined) {
        updateFields.push("birthday = ?");
        updateValues.push(birthday);
      }
      if (language_preference !== undefined) {
        updateFields.push("language_preference = ?");
        updateValues.push(language_preference);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "没有提供要更新的字段",
        });
      }

      // 添加用户ID到更新值数组
      updateValues.push(userId);

      // 执行更新
      const [result] = await pool.query(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: "用户信息更新成功",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }
    } catch (error) {
      console.error("更新用户信息错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器错误",
      });
    }
  }
);

// 删除用户
router.delete("/api/users/:id", async (req, res) => {
  try {
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 删除用户相关的好友关系
      await connection.query(
        "DELETE FROM friendships WHERE user_id = ? OR friend_id = ?",
        [req.params.id, req.params.id]
      );

      // 删除用户相关的黑名单记录
      await connection.query(
        "DELETE FROM blacklist WHERE user_id = ? OR blocked_user_id = ?",
        [req.params.id, req.params.id]
      );

      // 删除用户标签
      await connection.query("DELETE FROM user_tags WHERE user_id = ?", [
        req.params.id,
      ]);

      // 删除用户
      const [result] = await connection.query(
        "DELETE FROM users WHERE id = ?",
        [req.params.id]
      );

      // 提交事务
      await connection.commit();

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
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("删除用户错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

module.exports = router;

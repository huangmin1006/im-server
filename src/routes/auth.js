const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// 注册验证规则
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("用户名长度必须在3-50个字符之间")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("用户名只能包含字母、数字和下划线"),

  body("password").isLength({ min: 6 }).withMessage("密码长度至少为6个字符"),

  body("email").isEmail().withMessage("请输入有效的邮箱地址"),

  body("phone")
    .matches(/^1[3-9]\d{9}$/)
    .withMessage("请输入有效的手机号码"),

  body("nickname")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("昵称长度不能超过50个字符"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("性别只能是 male、female 或 other"),

  body("birthday").optional().isDate().withMessage("请输入有效的生日日期"),

  body("language_preference")
    .optional()
    .isIn(["zh-CN", "en-US"])
    .withMessage("语言偏好只能是 zh-CN 或 en-US"),
];

// 用户注册
router.post("/api/register", registerValidation, async (req, res) => {
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

    const {
      username,
      password,
      nickname,
      avatar,
      gender,
      birthday,
      phone,
      email,
      language_preference,
    } = req.body;

    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?",
      [username, email, phone]
    );

    if (existingUsers.length > 0) {
      const duplicateField =
        existingUsers[0].username === username
          ? "用户名"
          : existingUsers[0].email === email
          ? "邮箱"
          : "手机号";
      return res.status(400).json({
        success: false,
        message: `${duplicateField}已被使用`,
      });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 获取客户端信息
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    // 创建新用户
    const [result] = await pool.query(
      `INSERT INTO users (
        username, password, nickname, avatar, gender, birthday,
        phone, email, last_login_device, last_login_ip,
        account_status, language_preference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified', ?)`,
      [
        username,
        hashedPassword,
        nickname,
        avatar,
        gender,
        birthday,
        phone,
        email,
        userAgent,
        ip,
        language_preference,
      ]
    );

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        userId: result.insertId,
        username,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
    });
  }
});

module.exports = router;

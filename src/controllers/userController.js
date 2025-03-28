const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "im_db",
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 用户注册
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "用户名、密码和邮箱都是必填项",
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "用户名已存在",
      });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())",
      [username, hashedPassword, email]
    );

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        id: result.insertId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({
      success: false,
      message: "注册失败，请稍后重试",
    });
  }
};

module.exports = {
  register,
};

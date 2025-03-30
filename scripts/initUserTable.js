const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydatabase",
};

// 创建用户表的SQL语句
const createUserTableSQL = `
CREATE TABLE IF NOT EXISTS \`users\` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  gender ENUM('male', 'female', 'other') DEFAULT 'other',
  birthday DATE DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  status ENUM('online', 'offline', 'invisible') DEFAULT 'offline',
  last_active_time DATETIME DEFAULT NULL,
  signature VARCHAR(255) DEFAULT NULL,
  unread_message_count INT DEFAULT 0,
  device_info JSON DEFAULT NULL,
  language_preference ENUM('zh-CN', 'en-US') DEFAULT 'zh-CN',
  is_deleted TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function initUserTable() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log("数据库连接成功");

    // 删除用户表（如果存在）
    await connection.execute("DROP TABLE IF EXISTS `users`");
    console.log("已删除旧的用户表");

    // 创建新表
    await connection.execute(createUserTableSQL);
    console.log("创建新的用户表成功");
  } catch (error) {
    console.error("初始化用户表失败:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initUserTable();

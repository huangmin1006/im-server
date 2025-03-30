const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydatabase",
};

class UserModel {
  constructor() {
    this.pool = mysql.createPool(dbConfig);
  }

  async createUser(userData) {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO \`users\` (
          username, 
          password, 
          nickname, 
          avatar, 
          gender, 
          birthday, 
          phone, 
          email, 
          signature, 
          device_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.username,
          userData.password,
          userData.nickname,
          userData.avatar,
          userData.gender,
          userData.birthday,
          userData.phone,
          userData.email,
          userData.signature,
          JSON.stringify(userData.device_info),
        ]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async findByUsername(username) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM `users` WHERE username = ? AND is_deleted = 0",
        [username]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async findAdminByUsername(username) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM `admins` WHERE username = ?",
        [username]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async findByPhone(phone) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM `users` WHERE phone = ? AND is_deleted = 0",
        [phone]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async findByEmail(email) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM `users` WHERE email = ? AND is_deleted = 0",
        [email]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async findById(id) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM `users` WHERE id = ? AND is_deleted = 0",
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async getUserList(offset, pageSize, username, email, phone, status) {
    const connection = await this.pool.getConnection();
    try {
      // 确保参数是安全的数字
      const safeOffset = Math.max(0, Number(offset));
      const safePageSize = Math.max(1, Number(pageSize));

      // 获取总数
      const [countResult] = await connection.query(
        "SELECT COUNT(*) as total FROM users WHERE is_deleted = 0"
      );
      const total = Number(countResult[0].total);

      // 获取分页数据
      const [rows] = await connection.query(
        `SELECT * FROM users WHERE is_deleted = 0 ORDER BY id DESC LIMIT ${safePageSize} OFFSET ${safeOffset}`
      );

      return {
        total,
        list: rows,
      };
    } catch (error) {
      console.error("数据库查询错误:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserModel();

const pool = require("../db");

class UserDao {
  // 根据用户名查找用户
  async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  // 根据ID查找用户
  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  // 获取用户列表
  async getUserList(page = 1, pageSize = 10, filters = {}) {
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const { username = "", email = "", phone = "", status } = filters;

    let query = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.status, u.created_at,
      GROUP_CONCAT(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (username) {
      query += ` AND u.username LIKE ?`;
      params.push(`%${username}%`);
    }
    if (email) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${email}%`);
    }
    if (phone) {
      query += ` AND u.phone LIKE ?`;
      params.push(`%${phone}%`);
    }
    if (status !== undefined) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY u.id LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取用户总数
  async getUserCount(filters = {}) {
    const { username = "", email = "", phone = "", status } = filters;

    let query = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (username) {
      query += ` AND u.username LIKE ?`;
      params.push(`%${username}%`);
    }
    if (email) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${email}%`);
    }
    if (phone) {
      query += ` AND u.phone LIKE ?`;
      params.push(`%${phone}%`);
    }
    if (status !== undefined) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  // 获取用户角色
  async getUserRoles(userId) {
    const [rows] = await pool.execute(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.id 
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((row) => row.role_name);
  }

  // 创建新用户
  async createUser(username, password, email) {
    return await pool.execute(
      "INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())",
      [username, password, email]
    );
  }
}

module.exports = new UserDao();

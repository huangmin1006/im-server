const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // 替换为你的MySQL用户名
  password: "root", // 替换为你的MySQL密码
  database: "mydatabase", // 替换为你的数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

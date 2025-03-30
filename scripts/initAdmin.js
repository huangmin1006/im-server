const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydatabase",
};

// 创建管理员表的SQL
const createAdminTableSQL = `
CREATE TABLE IF NOT EXISTS \`admins\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL COMMENT '用户名',
  \`password\` varchar(255) NOT NULL COMMENT '密码',
  \`real_name\` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  \`roles\` json NOT NULL COMMENT '角色列表',
  \`status\` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  \`last_login_time\` datetime DEFAULT NULL COMMENT '最后登录时间',
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='管理员表';
`;

// 初始化管理员账号的SQL
const initAdminSQL = `
INSERT INTO \`admins\` (
  \`username\`, 
  \`password\`, 
  \`real_name\`, 
  \`roles\`, 
  \`status\`
) VALUES (
  'admin', 
  'admin123', 
  '系统管理员', 
  '["admin", "super"]', 
  1
) ON DUPLICATE KEY UPDATE
  \`password\` = VALUES(\`password\`),
  \`real_name\` = VALUES(\`real_name\`),
  \`roles\` = VALUES(\`roles\`),
  \`status\` = VALUES(\`status\`);
`;

async function initAdmin() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    // 创建管理员表
    await connection.execute(createAdminTableSQL);
    console.log("管理员表创建成功");

    // 初始化管理员账号
    await connection.execute(initAdminSQL);
    console.log("管理员账号初始化成功");

    console.log("管理员初始化完成");
  } catch (error) {
    console.error("初始化失败:", error);
  } finally {
    await connection.end();
  }
}

// 执行初始化
initAdmin();

const userDao = require("../dao/userDao");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// JWT 密钥
const JWT_SECRET = "your-secret-key"; // 在实际应用中应该使用环境变量

class UserService {
  // 用户注册
  async register(userData) {
    try {
      // 验证必填字段
      if (!userData.username || !userData.password || !userData.nickname) {
        throw new Error("用户名、密码和昵称是必填项");
      }

      // 验证用户名格式
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(userData.username)) {
        throw new Error("用户名只能包含字母、数字和下划线，长度3-20位");
      }

      // 验证密码强度
      if (userData.password.length < 6) {
        throw new Error("密码长度至少为6位");
      }

      // 验证手机号格式
      if (userData.phone && !/^1[3-9]\d{9}$/.test(userData.phone)) {
        throw new Error("请输入有效的手机号码");
      }

      // 验证邮箱格式
      if (
        userData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)
      ) {
        throw new Error("请输入有效的邮箱地址");
      }

      // 验证昵称长度
      if (userData.nickname.length > 50) {
        throw new Error("昵称长度不能超过50个字符");
      }

      // 检查用户名是否已存在
      const existingUser = await userModel.findByUsername(userData.username);
      if (existingUser) {
        throw new Error("用户名已存在");
      }

      // 检查手机号是否已存在
      if (userData.phone) {
        const existingPhone = await userModel.findByPhone(userData.phone);
        if (existingPhone) {
          throw new Error("手机号已被使用");
        }
      }

      // 检查邮箱是否已存在
      if (userData.email) {
        const existingEmail = await userModel.findByEmail(userData.email);
        if (existingEmail) {
          throw new Error("邮箱已被使用");
        }
      }

      // 处理设备信息
      if (userData.device_info) {
        userData.device_info = {
          device_type: userData.device_info.device_type || "unknown",
          device_name: userData.device_info.device_name || "unknown",
          os_version: userData.device_info.os_version || "unknown",
          app_version: userData.device_info.app_version || "1.0.0",
          last_login_time: new Date().toISOString(),
        };
      }

      // 创建用户
      const userId = await userModel.createUser(userData);

      return {
        id: userId,
        username: userData.username,
        nickname: userData.nickname,
        avatar: userData.avatar,
        status: "offline",
      };
    } catch (error) {
      throw error;
    }
  }

  // 用户登录
  async login(username, password) {
    try {
      // 先检查是否是管理员
      const admin = await userModel.findAdminByUsername(username);
      if (admin && admin.password === password) {
        // 确保 roles 是有效的 JSON 字符串
        let roles;
        try {
          roles =
            typeof admin.roles === "string"
              ? JSON.parse(admin.roles)
              : admin.roles;
        } catch (error) {
          roles = ["admin"]; // 如果解析失败，设置默认角色
        }

        const token = jwt.sign(
          { id: admin.id, username: admin.username },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        return {
          token,
          userInfo: {
            id: admin.id,
            username: admin.username,
            realName: admin.real_name,
            roles: roles,
          },
        };
      }

      // 如果不是管理员，检查普通用户
      const user = await userModel.findByUsername(username);
      if (!user) {
        throw new Error("用户不存在");
      }

      if (user.password !== password) {
        throw new Error("密码错误");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          status: user.status,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // 退出登录
  async logout(userId) {
    // 这里可以添加一些清理逻辑，比如清除token等
    return true;
  }

  // 获取用户信息
  async getUserInfo(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status,
    };
  }

  // 获取用户详细信息
  async getUserDetailInfo(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday,
      phone: user.phone,
      email: user.email,
      signature: user.signature,
      status: user.status,
      last_active_time: user.last_active_time,
      created_at: user.created_at,
    };
  }

  // 获取用户列表
  async getUserList(page, pageSize, filters) {
    try {
      const offset = (page - 1) * pageSize;
      const { username, email, phone, status } = filters;

      return await userModel.getUserList(
        offset,
        pageSize,
        username,
        email,
        phone,
        status
      );
    } catch (error) {
      console.error("获取用户列表失败:", error);
      throw error;
    }
  }

  // 验证token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("无效的token");
    }
  }
}

module.exports = new UserService();

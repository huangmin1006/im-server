# IM 后台管理系统接口文档

## 基础信息

- 基础路径：`/api`
- 服务器端口：8888
- 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`

## 用户认证相关接口

### 1. 用户登录

- 路径：`/api/auth/login`
- 方法：POST
- 功能：用户登录并获取 token
- 请求参数：
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- 响应示例：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "JWT token",
      "userInfo": {
        "id": "用户ID",
        "username": "用户名"
      }
    }
  }
  ```

### 2. 退出登录

- 路径：`/api/auth/logout`
- 方法：POST
- 功能：用户退出登录
- 需要认证：是
- 响应示例：
  ```json
  {
    "code": 200,
    "message": "退出登录成功"
  }
  ```

## 用户信息相关接口

### 1. 获取用户基本信息

- 路径：`/api/auth/info`
- 方法：GET
- 功能：获取当前登录用户的基本信息
- 需要认证：是
- 响应示例：
  ```json
  {
    "code": 200,
    "message": "获取用户信息成功",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱"
    }
  }
  ```

### 2. 获取用户详细信息

- 路径：`/api/auth/user/info`
- 方法：GET
- 功能：获取当前登录用户的详细信息，包括角色和真实姓名
- 需要认证：是
- 响应示例：
  ```json
  {
    "code": 200,
    "message": "获取用户详细信息成功",
    "data": {
      "roles": ["角色列表"],
      "realName": "真实姓名"
    }
  }
  ```

### 3. 获取用户列表

- 路径：`/api/user/list`
- 方法：GET
- 功能：获取用户列表，支持分页和筛选
- 需要认证：是
- 请求参数：
  - page: 页码（默认 1）
  - pageSize: 每页数量（默认 10）
  - username: 用户名筛选（可选）
  - email: 邮箱筛选（可选）
  - phone: 手机号筛选（可选）
  - status: 用户状态筛选（可选）
- 响应示例：
  ```json
  {
    "code": 0,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "id": "用户ID",
          "username": "用户名",
          "email": "邮箱",
          "phone": "手机号",
          "status": "状态"
        }
      ]
    },
    "message": "获取用户列表成功"
  }
  ```

### 4. 获取单个用户信息

- 路径：`/api/users/:id`
- 方法：GET
- 功能：根据用户 ID 获取指定用户的详细信息
- 需要认证：是
- 响应示例：
  ```json
  {
    "success": true,
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "nickname": "昵称",
      "avatar": "头像URL",
      "gender": "性别",
      "birthday": "生日",
      "phone": "手机号",
      "email": "邮箱",
      "last_login_time": "最后登录时间",
      "account_status": "账号状态",
      "unread_message_count": "未读消息数",
      "user_role": "用户角色",
      "language_preference": "语言偏好",
      "created_at": "创建时间",
      "updated_at": "更新时间"
    }
  }
  ```

## IM 用户相关接口

### 1. 用户注册

- 路径：`/api/users/register`
- 方法：POST
- 功能：新用户注册
- 请求参数：
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "nickname": "昵称",
    "avatar": "头像URL（可选）",
    "gender": "性别（可选）",
    "birthday": "生日（可选）",
    "phone": "手机号（可选）",
    "email": "邮箱（可选）",
    "signature": "个性签名（可选）",
    "device_info": {
      "device_type": "设备类型",
      "device_name": "设备名称",
      "os_version": "操作系统版本",
      "app_version": "应用版本"
    }
  }
  ```
- 响应示例：
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "nickname": "昵称",
      "avatar": "头像URL",
      "status": "offline"
    }
  }
  ```
- 字段说明：
  - username: 用户名，3-20 位，只能包含字母、数字和下划线
  - password: 密码，至少 6 位
  - nickname: 昵称，必填，最大 50 个字符
  - gender: 可选值：male、female、other
  - phone: 中国大陆手机号格式
  - email: 标准邮箱格式
  - device_info: 设备信息，用于多端同步

## 系统状态接口

### 1. 服务器状态检查

- 路径：`/`
- 方法：GET
- 功能：检查服务器运行状态
- 响应示例：
  ```json
  {
    "message": "服务器运行正常"
  }
  ```

## 错误响应格式

所有接口在发生错误时都会返回统一的错误格式：

```json
{
  "code": 错误码,
  "message": "错误信息"
}
```

### 常见错误码

- 200: 成功
- 400: 请求参数错误
- 401: 未认证或认证失败
- 404: 资源不存在
- 500: 服务器内部错误

## 数据验证规则

### 用户注册验证规则

- 用户名：
  - 长度：3-20 个字符
  - 格式：只能包含字母、数字和下划线
- 密码：
  - 最小长度：6 个字符
- 邮箱：
  - 格式：有效的邮箱地址
- 手机号：
  - 格式：中国大陆手机号（1 开头的 11 位数字）
- 昵称：
  - 最大长度：50 个字符
- 性别：
  - 可选值：male、female、other
- 语言偏好：
  - 可选值：zh-CN、en-US

## 注意事项

1. 所有需要认证的接口必须在请求头中携带有效的 JWT token
2. 密码在传输和存储时都会进行加密处理
3. 用户注册时会自动记录注册 IP 和设备信息
4. 接口返回的时间格式统一使用 ISO 8601 标准
5. 分页接口的页码从 1 开始计数

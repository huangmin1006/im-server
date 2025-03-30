const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// 需要认证的路由
router.use(authMiddleware);
router.get("/info", userController.getUserDetailInfo);

// 获取用户列表
router.get("/list", userController.getUserList);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// 登录路由
router.post("/login", userController.login);

// 需要认证的路由
router.use(authMiddleware);
router.post("/logout", userController.logout);
router.get("/info", userController.getUserInfo);
router.get("/user/info", userController.getUserDetailInfo);

module.exports = router;

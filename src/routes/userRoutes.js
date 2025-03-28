const express = require("express");
const router = express.Router();
const { register } = require("../controllers/userController");

// 用户注册路由
router.post("/register", register);

module.exports = router;

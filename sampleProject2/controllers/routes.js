const AuthController = require("../controllers/auth");
const express = require('express');

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/profile", AuthController.profile);
router.post("/logout", AuthController.logout);

module.exports = router;
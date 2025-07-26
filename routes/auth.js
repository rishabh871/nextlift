const router = require("express").Router();
const authController = require("../controllers/AuthController");
const pageController = require("../controllers/PageController");
const {loginValidate,forgotPasswordValidate,resetPasswordValidate,registerValidate} = require("../validator/Auth");

router.post("/login",loginValidate,authController.login);
router.post("/forgot-password",forgotPasswordValidate,authController.forgotPassword);
router.get("/reset-password-token",authController.forgotPasswordToken);
router.post("/reset-password",resetPasswordValidate,authController.resetPassword);
router.post("/register",registerValidate,authController.register);
router.get("/states",authController.states);
router.get("/faqs",authController.faqs);
router.get("/pages/:slug",pageController.webPage);
module.exports = router;
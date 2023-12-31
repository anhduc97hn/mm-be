const express = require("express");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");

/**
 * @route POST /auth/login
 * @description Log in with email and password
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @route POST /auth/googlelogin
 * @description Log in OAuth2
 * @access Public
 */
router.post(
  "/googlelogin",
  authController.loginWithGoogle
);

/**
 * @route PUT /auth/forgotpassword
 * @description forget password 
 * @access Public
 */
router.put(
  "/forgotpassword",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
  ]),
  authController.forgotPassword
);

/**
 * @route PUT /auth/resetpassword
 * @description reset password  
 * @access resetToken access
 */
router.put(
  "/resetpassword",
  validators.validate([
    body("newPassword", "Invalid new password").exists().notEmpty(),
    body("resetToken", "Invalid reset link").exists().notEmpty(),
  ]),
  authController.resetPassword
);

module.exports = router;

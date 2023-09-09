const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");

const userProfileController = require("../controllers/userProfile.controller");

/**
 * @route GET /userProfiles?page=1&limit=10
 * @description Get userProfiles with pagination
 * @access Public
 */
router.get("/", userProfileController.getUsers);

/**
 * @route GET /userProfiles/me
 * @description Get current user info
 * @access Login required
 */
router.get(
  "/me",
  authMiddleware.loginRequired,
  userProfileController.getCurrentUser
);

/**
 * @route GET /userProfiles/:userProfileId
 * @description Get a user profile
 * @access Public
 */
router.get(
  "/:userProfileId",
  validators.validate([
    param("userProfileId").exists().isString().custom(validators.checkObjectId),
  ]),
  userProfileController.getSingleUser
);

/**
 * @route PUT /userProfiles/me
 * @description Update user profile
 * @access Login required
 */
router.put(
  "/me",
  authMiddleware.loginRequired,
  userProfileController.updateProfile
);

const reviewController = require("../controllers/review.controller");
/**
 * @route GET /userProfiles/:userProfileId/reviews
 * @description Get all reviews of a mentor
 * @access Public
 */
router.get(
  "/:userProfileId/reviews",
  validators.validate([
    param("userProfileId").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.getReviews
);

module.exports = router;

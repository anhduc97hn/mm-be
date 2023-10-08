const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const reviewController = require("../controllers/review.controller")

/**
 * @route GET /reviews/:reviewId
 * @description Get details of a review
 * @access Login required
 */
router.get(
  "/:reviewId",
  authMiddleware.loginRequired,
  validators.validate([
    param("reviewId").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.getSingleReview
);

module.exports = router;

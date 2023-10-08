const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");

const eduController = require("../controllers/edu.controller");

/**
 * @route POST /educations
 * @description Create a new education form
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("degree", "Invalid degree").exists().notEmpty(),
    body("end_year", "Invalid end year").exists().notEmpty(),
    body("field", "Invalid field").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
  ]),
  eduController.createNewEdu
);

/**
 * @route GET /educations?page=1&limit=10
 * @description Get all education of the current user with pagination
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  eduController.getEdu
);

/**
 * @route PUT /educations/:educationId
 * @description Update an education
 * @access Login required
 */
router.put(
  "/:educationId",
  authMiddleware.loginRequired,
  validators.validate([
    param("educationId").exists().isString().custom(validators.checkObjectId),
  ]),
  eduController.updateSingleEdu
);

/**
 * @route DELETE /educations/:educationId
 * @description Delete an education
 * @access Login required
 */
router.delete(
  "/:educationId",
  authMiddleware.loginRequired,
  validators.validate([
    param("educationId").exists().isString().custom(validators.checkObjectId),
  ]),
  eduController.deleteSingleEdu
);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");

const certiController = require("../controllers/certi.controller");

/**
 * @route POST /certifications
 * @description Create a new certification
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
  ]),
  certiController.createNewCerti
);

/**
 * @route GET /certifications?page=1&limit=10
 * @description Get all certi of the current user with pagination
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  certiController.getCerti
);

/**
 * @route PUT /certifications/:certiId
 * @description Update a certi
 * @access Login required
 */
router.put(
  "/:certiId",
  authMiddleware.loginRequired,
  validators.validate([
    param("certiId").exists().isString().custom(validators.checkObjectId),
  ]),
  certiController.updateSingleCerti
);

/**
 * @route DELETE /certifications/:certiId
 * @description Delete a certi
 * @access Login required
 */
router.delete(
  "/:certiId",
  authMiddleware.loginRequired,
  validators.validate([
    param("certiId").exists().isString().custom(validators.checkObjectId),
  ]),
  certiController.deleteSingleCerti
);

module.exports = router;

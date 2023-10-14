const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");

const expController = require("../controllers/exp.controller");

/**
 * @route POST /experiences
 * @description Create a new experience form
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.mentorAccessRequired, 
  validators.validate([
    body("company", "Invalid company").exists().notEmpty(),
    body("industry", "Invalid industry").exists().notEmpty(),
    body("location", "Invalid location").exists().notEmpty(),
    body("position", "Invalid position").exists().notEmpty(),
  ]),
  expController.createNewExp
);

/**
 * @route GET /experiences?page=1&limit=10
 * @description Get all experience of the current user with pagination
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.mentorAccessRequired, 
  expController.getExp
);

/**
 * @route PUT /experiences/:expId
 * @description Update an experience
 * @access Login required
 */
router.put(
  "/:expId",
  authMiddleware.loginRequired,
  authMiddleware.mentorAccessRequired, 
  validators.validate([
    param("expId").exists().isString().custom(validators.checkObjectId),
  ]),
  expController.updateSingleExp
);

/**
 * @route DELETE /experiences/:expId
 * @description Delete an experience
 * @access Login required
 */
router.delete(
  "/:expId",
  authMiddleware.loginRequired,
  authMiddleware.mentorAccessRequired, 
  validators.validate([
    param("expId").exists().isString().custom(validators.checkObjectId),
  ]),
  expController.deleteSingleExp
);

module.exports = router;

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
 * @route GET /userProfiles/:id
 * @description Get a user profile
 * @access Public
 */
router.get(
    "/:id",
    validators.validate([
      param("id").exists().isString().custom(validators.checkObjectId),
    ]),
    userProfileController.getSingleUser
  );

/**
 * @route GET /userProfiles/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", authMiddleware.loginRequired, userProfileController.getCurrentUser);  


/**
 * @route PUT /userProfiles/me
 * @description Update user profile
 * @access Login required
 */
router.put("/me", authMiddleware.loginRequired, userProfileController.updateProfile);

const reviewController = require("../controllers/review.controller")
/**
 * @route GET /userProfiles/:id/reviews
 * @description Get all reviews of a mentor
 * @access Public
 */
router.get(
  "/:id/reviews",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.getReviews
);


// *** CRUD MENTOR PROFILE: EDU | EXP | POSITION | CERTIFICATION *** 

const eduController = require("../controllers/edu.controller")

/**
 * @route POST /userProfiles/education
 * @description Create a new education form 
 * @access Login required
 */
router.post(
  "/education",
  authMiddleware.loginRequired,
  eduController.createNewEdu
);

/**
 * @route GET /userProfiles/education?page=1&limit=10
 * @description Get all education the current user can see with pagination
 * @access Login required
 */
router.get(
  "/education",
  validators.validate([
    authMiddleware.loginRequired,
  ]),
  eduController.getEdu
);

/**
 * @route PUT /userProfiles/education/:id
 * @description Update an education
 * @access Login required
 */
router.put(
  "/education/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId)
  ]),
  eduController.updateSingleEdu
);

/**
 * @route DELETE /userProfiles/education/:id
 * @description Delete an education 
 * @access Login required
 */
router.delete(
  "/education/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  eduController.deleteSingleEdu
);

const expController = require("../controllers/exp.controller")

/**
 * @route POST /userProfiles/experiences
 * @description Create a new experience form
 * @access Login required
 */
router.post("/experiences", authMiddleware.loginRequired, expController.createNewExp);

/**
 * @route GET /userProfiles/experiences?page=1&limit=10
 * @description Get all experience that the current user can see with pagination
 * @access Login required
 */
router.get(
  "/experiences",
  validators.validate([authMiddleware.loginRequired]),
  expController.getExp
);

/**
 * @route PUT /userProfiles/experiences/:id
 * @description Update an experience
 * @access Login required
 */
router.put(
  "/experiences/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  expController.updateSingleExp
);

/**
 * @route DELETE /userProfiles/experiences/:id
 * @description Delete an experience
 * @access Login required
 */
router.delete(
  "/experiences/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  expController.deleteSingleExp
);

const positionController = require("../controllers/position.controller")

/**
 * @route POST /userProfiles/experiences/positions
 * @description Create a new position of an experience 
 * @access Login required
 */
router.post("/experiences/positions", authMiddleware.loginRequired, positionController.createNewPosition);

/**
 * @route GET /userProfiles/experiences/positions
 * @description Get all positions of an experience of the current user 
 * @access Login required
 */
router.get(
  "/experiences/positions",
  validators.validate([authMiddleware.loginRequired]),
  positionController.getPositions
);

/**
 * @route PUT /userProfiles/experiences/positions/:id
 * @description Update a position
 * @access Login required
 */
router.put(
  "/experiences/positions/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  positionController.updateSinglePosition
);

/**
 * @route DELETE /userProfiles/experiences/positions/:id
 * @description Delete a position
 * @access Login required
 */
router.delete(
  "/experiences/positions/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  positionController.deleteSinglePosition
);


const certiController = require("../controllers/certi.controller")

/**
 * @route POST /userProfiles/certifications
 * @description Create a new certification
 * @access Login required
 */
router.post("/certifications", authMiddleware.loginRequired, certiController.createNewCerti);

/**
 * @route GET /userProfiles/certifications?page=1&limit=10
 * @description Get all certi that the current user can see with pagination
 * @access Login required
 */
router.get(
  "/certifications",
  validators.validate([authMiddleware.loginRequired]),
  certiController.getCerti
);

/**
 * @route PUT /userProfiles/certifications/:id
 * @description Update a certi
 * @access Login required
 */
router.put(
  "/certifications/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  certiController.updateSingleCerti
);

/**
 * @route DELETE /userProfiles/certifications/:id
 * @description Delete a certi
 * @access Login required
 */
router.delete(
  "/certifications/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  certiController.deleteSingleCerti
);


module.exports = router;
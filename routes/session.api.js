const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");


const reviewController = require("../controllers/review.controller")
/**
 * @route POST /sessions/:sessionId/reviews
 * @description Create a new review on a session
 * @access Login required
 */
router.post(
  "/:sessionId/reviews",
  authMiddleware.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("rating", "Missing rating").exists().notEmpty(),
    param("sessionId").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.createNewReview
);

const sessionController = require("../controllers/session.controller")
/**
 * @route POST /sessions/requests/:userProfileId
 * @description Send a session request
 * @access Login required
 */
router.post(
  "/requests/:userProfileId",
  authMiddleware.loginRequired,
  validators.validate([
    param("userProfileId").exists().isString().custom(validators.checkObjectId),
    body("topic", "missing topic").exists().notEmpty(),
    body("problem", "missing problem").exists().notEmpty(),
    body("startDateTime", "missing startDateTime").exists().notEmpty(),
    body("endDateTime", "missing endDateTime").exists().notEmpty(),
  ]),
  sessionController.sendSessionRequest
);

/**
 * @route GET /sessions/requests/incoming
 * @description Get the list of received pending requests
 * @access Login required
 */
router.get(
  "/requests/incoming",
  authMiddleware.loginRequired,
  sessionController.getReceivedSessionRequestList
);

/**
 * @route GET /sessions/requests/outgoing
 * @description Get the list of sent pending requests
 * @access Login required
 */
router.get(
  "/requests/outgoing",
  authMiddleware.loginRequired,
  sessionController.getSentSessionRequestList
);

/**
 * @route PUT /sessions/:sessionId
 * @description Accept/Reject/Cancel/Complete/etc update a session status 
 * @access Login required
 */
router.put(
  "/:sessionId",
  authMiddleware.loginRequired,
  validators.validate([
    param("sessionId").exists().isString().custom(validators.checkObjectId),
    // body("status").exists().isString().isIn(["pending","accepted", "declined", "completed", "cancelled", "reviewed"]),
  ]),
  sessionController.reactSessionRequest
);

/**
 * @route GET /sessions
 * @description Get the list of sessions
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  sessionController.getSessionList
);

module.exports = router;
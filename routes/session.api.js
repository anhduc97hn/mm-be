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
  "/:id/reviews",
  authMiddleware.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("rating", "Missing rating").exists().notEmpty(),
    body("sessionId", "Missing sessionId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  reviewController.createNewReview
);

const sessionController = require("../controllers/session.controller")
/**
 * @route POST /sessions/requests/:userId
 * @description Send a session request
 * @access Login required
 */
router.post(
  "/requests",
  authMiddleware.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
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
 * @route PUT /sessions/requests/:userId
 * @description Accept/Reject a received pending requests
 * @access Login required
 */
router.put(
  "/requests/:userId",
  authMiddleware.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accepted", "declined"]),
  ]),
  sessionController.reactSessionRequest
);

/**
 * @route DELETE /sessions/requests/:userId
 * @description Cancel a Session request
 * @access Login required
 */
router.delete(
  "/requests/:userId",
  authMiddleware.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  sessionController.cancelSessionRequest
);

/**
 * @route GET /sessions
 * @description Get the list of sessions
 * @access Login required
 */
router.get("/", authMiddleware.loginRequired, sessionController.getSessionList);

module.exports = router;
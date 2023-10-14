const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Review = require("../models/Review");
const Session = require("../models/Session");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

const reviewController = {};

const calculateReviewCount = async (userProfileId) => {
  const sessions = await Session.find({
    to: userProfileId,
    status: "reviewed",
  });

  // Count the reviews for these sessions
  const reviewCount = await Review.countDocuments({
    session: { $in: sessions.map((session) => session._id) },
  });

  // Save it to DB

  await UserProfile.findByIdAndUpdate(userProfileId, {
    reviewCount: reviewCount,
  });
};

const calculateAverageRating = async (userProfileId) => {
  const sessions = await Session.find({
    to: userProfileId,
    status: "reviewed",
  });

  // Find reviews for these sessions
  const reviews = await Review.find({
    session: { $in: sessions.map((session) => session._id) },
  });

  if (reviews.length === 0) {
    // No reviews found, set the average rating to 0 or any default value
    const reviewAverageRating = 0;
    return reviewAverageRating;
  }

  // Calculate the average rating based on reviews
  const ratings = reviews.map((review) => review.rating);
  const reviewAverageRating =
    ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;

    // Save it to DB 
  await UserProfile.findByIdAndUpdate(userProfileId, {
    reviewAverageRating: reviewAverageRating,
  });
};

reviewController.createNewReview = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const { content, rating } = req.body;

  const session = await Session.findByIdAndUpdate(sessionId, {status: "reviewed"});
  if (!session)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Session not found", ERROR_TYPES.NOT_FOUND);

  const review = await Review.create({
    session: sessionId,
    content,
    rating,
  });
  await calculateReviewCount(session.to);
  await calculateAverageRating(session.to);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    review,
    null,
    "Create new review successful"
  );
});

reviewController.getSingleReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params; 

  const review = await Review.findById(reviewId)
    .populate("session")

  if (!review)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Review not found", ERROR_TYPES.NOT_FOUND);

  return sendResponse(res, HTTP_STATUS.OK, true, review, null, null);
});

reviewController.getReviews = catchAsync(async (req, res, next) => {
  const { userProfileId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const mentorProfile = await UserProfile.findById(userProfileId);
  if (!mentorProfile)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Mentor not found", ERROR_TYPES.NOT_FOUND);

  const sessionsOfMentor = await Session.find({ to: userProfileId });

  const sessionIds = sessionsOfMentor.map((session) => session._id)

  const count = await Review.countDocuments({ session: { $in: sessionIds } })
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const reviews = await Review.find({ session: { $in: sessionIds } })
    .populate({
      path: "session",
      populate: { path: "from to" },
    })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(res, HTTP_STATUS.OK, true, { reviews, totalPages, count }, null, "");
});

module.exports = reviewController;

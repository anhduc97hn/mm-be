const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Review = require("../models/Review");
const Session = require("../models/Session");
const UserProfile = require("../models/UserProfile");
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
    throw new AppError(404, "Session not found", "Create New Review Error");

  const review = await Review.create({
    session: sessionId,
    content,
    rating,
  });
  await calculateReviewCount(session.to);
  await calculateAverageRating(session.to);

  return sendResponse(
    res,
    200,
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
    throw new AppError(404, "Review not found", "Get Single Review Error");

  return sendResponse(res, 200, true, review, null, null);
});

reviewController.getReviews = catchAsync(async (req, res, next) => {
  const {userProfileId} = req.params; 
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const mentorProfile = await UserProfile.findById(userProfileId);
  if (!mentorProfile) throw new AppError(404, "Mentor not found", "Get Reviews Error");

  const reviewWithSessions = await Review.find().populate("session");

  const count = reviewWithSessions.filter((review) => review.session.to.toString() === userProfileId).length;
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const reviews = await reviewWithSessions
  .filter((review) => review.session.to.toString() === userProfileId)
  .sort((a, b) => b.createdAt - a.createdAt)
  .slice(offset, offset + limit);

  return sendResponse(res, 200, true, { reviews, totalPages, count }, null, "");
});

module.exports = reviewController;

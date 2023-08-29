const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Review = require("../models/Review");
const UserProfile = require("../models/UserProfile");
const reviewController = {};

const calculateReviewCount = async (mentorId) => {
  const reviewCount = await Review.countDocuments({ to: mentorId });
  await UserProfile.findOneAndUpdate(
    { userId: mentorId },
    { reviewCount: reviewCount }
  );
};

const calculateAverageRating = async (mentorId) => {
  const result = await Review.aggregate([
    {
      $match: { to: mentorId },
    },
    {
      $group: { _id: null, reviewAverageRating: { $avg: "$rating" } },
    },
  ]);
  await UserProfile.findOneAndUpdate(
    {
      userId: mentorId,
    },
    { reviewAverageRating: result[0].reviewAverageRating }
  );
};

reviewController.createNewReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const sessionId = req.params.id;
  const { content, rating, mentorId } = req.body;

  const session = session.findById(sessionId);
  if (!session)
    throw new AppError(404, "Session not found", "Create New Review Error");

  const review = await Review.create({
    from: userId,
    to: mentorId,
    session: sessionId,
    content,
    rating,
  });
  await calculateReviewCount(mentorId);
  await calculateAverageRating(mentorId);

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
  const review = await Review.findById(req.params.id)
    .populate("session")
    .populate("from")
    .populate("to");

  if (!review)
    throw new AppError(404, "Review not found", "Get Single Review Error");

  return sendResponse(res, 200, true, review, null, null);
});

reviewController.getReviews = catchAsync(async (req, res, next) => {
  const mentorId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const mentor = UserProfile.findOne({userId: mentorId});
  if (!mentor) throw new AppError(404, "Mentor not found", "Get Reviews Error");

  const count = await Review.countDocuments({ to: mentorId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const reviews = await Review.find({ to: mentorId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)

  return sendResponse(res, 200, true, { reviews, totalPages, count }, null, "");
});

module.exports = reviewController;

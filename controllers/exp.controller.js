const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Experience = require("../models/Experience");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

const expController = {};

expController.createNewExp = catchAsync(async (req, res, next) => {
  const { ...expFields } = req.body;
  const userId = req.userId;

  const userProfile = await UserProfile.findOne({ userId: userId });

  let experience = await Experience.create({
    ...expFields,
    userProfile: userProfile._id,
  });

  userProfile.experiences.push(experience._id);
  await userProfile.save();

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    experience,
    null,
    "Create new exp successful"
  );
});

expController.getExp = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { page, limit } = req.query;

  
  const currentUserProfile = await UserProfile.findOne({
    userId: currentUserId,
  });

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [
    { isDeleted: false },
    { userProfile: currentUserProfile._id },
  ];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Experience.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const experiences = await Experience.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { experiences, totalPages, count },
    null,
    ""
  );
});

expController.updateSingleExp = catchAsync(async (req, res, next) => {
  const { expId } = req.params;

  const experience = await Experience.findById(expId);
  if (!experience)
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Experience not found",
      ERROR_TYPES.NOT_FOUND
    );

  const allows = ["company", "industry", "location", "position", "url"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      experience[field] = req.body[field];
    }
  });

  await experience.save();
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    experience,
    null,
    "Update Experience successful"
  );
});

expController.deleteSingleExp = catchAsync(async (req, res, next) => {
  const { expId } = req.params;

  // hard delete because it's referenced to user profile.
  const experience = await Experience.findByIdAndDelete(expId);

  if (!experience)
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Experience not found",
      ERROR_TYPES.NOT_FOUND
    );

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    experience,
    null,
    "Delete Experience successful"
  );
});

module.exports = expController;

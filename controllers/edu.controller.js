const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Education = require("../models/Education");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");
const eduController = {};

eduController.createNewEdu = catchAsync(async (req, res, next) => {
  const { ...eduFields } = req.body;
  const userId = req.userId; 

  const userProfile = await UserProfile.findOne({userId: userId})

  let education = await Education.create({
    ...eduFields,
    userProfile: userProfile._id, 
  });

  userProfile.education.push(education._id);
  await userProfile.save(); 

  return sendResponse(res, HTTP_STATUS.OK, true, education, null, "Create new edu successful");
});

eduController.getEdu = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;
  const currentUserId = req.userId;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const currentUserProfile = await UserProfile.findOne({
    userId: currentUserId,
  });

  const filterConditions = [
    { isDeleted: false },
    { userProfile: currentUserProfile._id },
  ];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Education.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const educations = await Education.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { educations, totalPages, count },
    null,
    ""
  );
});

eduController.updateSingleEdu = catchAsync(async (req, res, next) => {
  const { educationId } = req.params;

  const education = await Education.findById(educationId);
  if (!education)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Education not found", ERROR_TYPES.NOT_FOUND);

  const allows = ["degree", "end_year", "field", "description", "url"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      education[field] = req.body[field];
    }
  });

  await education.save();
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    education,
    null,
    "Update Education successful"
  );
});

eduController.deleteSingleEdu = catchAsync(async (req, res, next) => {
  const { educationId } = req.params;

  // hard delete because it's referenced to user profile.
  const education = await Education.findByIdAndDelete(educationId);

  if (!education)
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Education not found",
      ERROR_TYPES.NOT_FOUND
    );

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    education,
    null,
    "Delete Education successful"
  );
});

module.exports = eduController;

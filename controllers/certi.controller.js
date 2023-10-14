const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Certification = require("../models/Certification");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");
const certiController = {};

certiController.createNewCerti = catchAsync(async (req, res, next) => {
  const { ...certiFields } = req.body;
  const userId = req.userId;

  const userProfile = await UserProfile.findOne({ userId: userId });

  let certification = await Certification.create({
    ...certiFields,
    userProfile: userProfile._id,
  });

  userProfile.certifications.push(certification._id);
  await userProfile.save();

  return sendResponse(res, HTTP_STATUS.OK, true, certification, null, "Create new certi successful");
});

certiController.getCerti = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { page, limit } = req.query;

  const currentUserProfile = await UserProfile.findOne({userId: currentUserId});
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ isDeleted: false }, {userProfile: currentUserProfile._id}];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Certification.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const certifications = await Certification.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
  
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { certifications, totalPages, count },
    null,
    ""
  );
});

certiController.updateSingleCerti = catchAsync(async (req, res, next) => {
  const { certiId } = req.params;

  const certification = await Certification.findById(certiId);
  if (!certification)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Certification not found", ERROR_TYPES.NOT_FOUND);

  const allows = ["name", "description", "url"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      certification[field] = req.body[field];
    }
  });

  await certification.save();
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    certification,
    null,
    "Update Certification successful"
  );
});

certiController.deleteSingleCerti = catchAsync(async (req, res, next) => {
  const { certiId } = req.params;

  // hard delete because it's referenced to user profile.
  const certification = await Certification.findByIdAndDelete(certiId);

  if (!certification)
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Certification not found",
      ERROR_TYPES.NOT_FOUND
    );

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    certification,
    null,
    "Delete Certification successful"
  );
});

module.exports = certiController;

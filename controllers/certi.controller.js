const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Certification = require("../models/Certification");
const UserProfile = require("../models/UserProfile");
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

  return sendResponse(res, 200, true, certification, null, "Create new certi successful");
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
    200,
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
    throw new AppError(404, "Certification not found", "Update Certification Error");

  const allows = ["name", "description", "url"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      certification[field] = req.body[field];
    }
  });

  await certification.save();
  return sendResponse(
    res,
    200,
    true,
    certification,
    null,
    "Update Certification successful"
  );
});

certiController.deleteSingleCerti = catchAsync(async (req, res, next) => {
  const { certiId } = req.params;

  const certification = await Certification.findByIdAndUpdate(
    certiId,
    { isDeleted: true },
    { new: true }
  );

  if (!certification)
    throw new AppError(
      400,
      "Certification not found or User not authorized",
      "Delete Certification Error"
    );

  return sendResponse(
    res,
    200,
    true,
    certification,
    null,
    "Delete Certification successful"
  );
});

module.exports = certiController;

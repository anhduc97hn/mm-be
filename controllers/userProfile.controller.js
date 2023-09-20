const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const UserProfile = require("../models/UserProfile");
const userProfileController = {};

userProfileController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const userProfile = await UserProfile.findOne({ userId: userId });
  if (!userProfile)
    throw new AppError(400, "User not found", "Get Current User Error");

  return sendResponse(
    res,
    200,
    true,
    userProfile,
    null,
    "Get current user successful"
  );
});

userProfileController.getUsers = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isMentor: true }];
  if (filter.name) {
    filterConditions.push({
      name: { $regex: filter.name, $options: "i" },
    });
  }
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await UserProfile.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const userProfiles = await UserProfile.find(filterCrireria)
    .populate("education")
    .populate("experiences")
    .populate("certifications")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { userProfiles, totalPages, count },
    null,
    ""
  );
});

userProfileController.getFeaturedUsers = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 9;

  const filterConditions = [{ isMentor: true }];

  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await UserProfile.countDocuments(filterCrireria);
  const offset = limit * (page - 1);

  const userProfiles = await UserProfile.find(filterCrireria)
    .populate("education")
    .populate("experiences")
    .populate("certifications")
    .sort({ sessionCount: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(res, 200, true, { userProfiles, count }, null, "");
});

userProfileController.getSingleUser = catchAsync(async (req, res, next) => {
  const { userProfileId } = req.params;

  const userProfile = await UserProfile.findById(userProfileId)
    .populate("education")
    .populate("experiences")
    .populate("certifications");
  if (!userProfile)
    throw new AppError(404, "User not found", "Get Single User Error");

  return sendResponse(res, 200, true, userProfile, null, "");
});

userProfileController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const userProfile = await UserProfile.findOne({ userId: userId });

  if (!userProfile)
    throw new AppError(404, "Account not found", "Update Profile Error");

  const allows = [
    "name",
    "avatarUrl",
    "aboutMe",
    "city",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
    "currentCompany",
    "currentPosition",
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await userProfile.save();
  return sendResponse(
    res,
    200,
    true,
    userProfile,
    null,
    "Update Profile successfully"
  );
});

module.exports = userProfileController;

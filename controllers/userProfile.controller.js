const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

const userProfileController = {};

userProfileController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const userProfile = await UserProfile.findOne({ userId: userId }).populate("userId");
  if (!userProfile)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found", ERROR_TYPES.NOT_FOUND);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    userProfile,
    null,
    "Get current user successful"
  );
});

userProfileController.getUsers = catchAsync(async (req, res, next) => {
  let { page, limit, filter } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
 
  const filterConditions = [{ isMentor: true }];

  if (filter.searchQuery) {
    filterConditions.push({
      name: { $regex: filter.searchQuery, $options: "i" },
    });
  }

  if (filter.company) {
    filterConditions.push({
      currentCompany: { $regex: filter.company, $options: "i" },
    });
  }

  if (filter.position) {
    filterConditions.push({
      currentPosition: { $regex: filter.position, $options: "i" },
    });
  }

  if (filter.city) {
    filterConditions.push({
      city: { $regex: filter.city, $options: "i" },
    });
  }
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await UserProfile.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const sortOptions = {};
  switch (filter.sortBy) {
    case "sessionDesc":
      sortOptions.sessionCount = -1;
      break;
    case "newest":
      sortOptions.createdAt = -1;
      break;
    case "reviewDesc":
      sortOptions.reviewAverageRating = -1;
      break;
    default:
      sortOptions.reviewAverageRating = -1; // Default case
  }

  const userProfiles = await UserProfile.find(filterCrireria)
    .populate("education")
    .populate("experiences")
    .populate("certifications")
   .sort(sortOptions)
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
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

  return sendResponse(res, HTTP_STATUS.OK, true, { userProfiles, count }, null, "");
});

userProfileController.getSingleUser = catchAsync(async (req, res, next) => {
  const { userProfileId } = req.params;

  const userProfile = await UserProfile.findById(userProfileId)
    .populate("education")
    .populate("experiences")
    .populate("certifications");
  if (!userProfile)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found", ERROR_TYPES.NOT_FOUND);

  return sendResponse(res, HTTP_STATUS.OK, true, userProfile, null, "");
});

userProfileController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const userProfile = await UserProfile.findOne({ userId: userId });

  if (!userProfile)
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Account not found", ERROR_TYPES.NOT_FOUND);

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
      userProfile[field] = req.body[field];
    }
  });

  await userProfile.save();
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    userProfile,
    null,
    "Update Profile successfully"
  );
});

module.exports = userProfileController;

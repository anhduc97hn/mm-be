const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const UserProfile = require("../models/UserProfile");
const userProfileController = {};

userProfileController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await UserProfile.findOne({userId: userId});
  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});

userProfileController.getUsers = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = req.query; 

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{isMentor: true}];
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

  const users = await UserProfile.find(filterCrireria)
    .populate("education")
    .populate("experience")
    .populate("certifications")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { users, totalPages, count },
    null,
    ""
  );
});

userProfileController.getSingleUser = catchAsync(async (req, res, next) => {
  const {userProfileId} = req.params;

  let user = await UserProfile.findById(userProfileId)
    .populate("education")
    .populate("experience")
    .populate("certifications");
  if (!user) throw new AppError(404, "User not found", "Get Single User Error");

  return sendResponse(res, 200, true, user, null, "");
});

userProfileController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await UserProfile.findOne({userId: userId});
  if (!user)
    throw new AppError(404, "Account not found", "Update Profile Error");

  const allows = [
    "avatarUrl",
    "aboutMe",
    "city",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
    "currentCompany",
    "currentPosition"
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update Profile successfully"
  );
});


module.exports = userProfileController;
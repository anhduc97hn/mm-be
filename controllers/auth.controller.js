const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const authController = {};
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "+password");

  if (!user)
    return next(new AppError(HTTP_STATUS.NOT_FOUND, "Invalid credentials", ERROR_TYPES.NOT_FOUND));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError(HTTP_STATUS.BAD_REQUEST, "Wrong password", ERROR_TYPES.BAD_REQUEST));

  accessToken = await user.generateToken();
  const userProfile = await UserProfile.findOne({userId: user._id}).populate("userId")
  
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { userProfile, accessToken },
    null,
    "Login successful"
  );
});

module.exports = authController;

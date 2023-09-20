const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "+password");
  if (!user)
    return next(new AppError(400, "Invalid credentials", "Login Error"));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError(400, "Wrong password", "Login Error"));

  accessToken = await user.generateToken();
  const userProfile = await UserProfile.findOne({userId: user._id})
  
  return sendResponse(
    res,
    200,
    true,
    { userProfile, accessToken },
    null,
    "Login successful"
  );
});

module.exports = authController;

const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password, isMentor } = req.body;

  let user = await User.findOne({ email });
  if (user) throw new AppError(409, "User already exists", "Register Error");

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({
    email,
    password,
  });
  const accessToken = await user.generateToken();

  const userProfile = await UserProfile.create({
    userId: user._id,
    isMentor,
    name,
  });

  return sendResponse(
    res,
    200,
    true,
    { userProfile, accessToken },
    null,
    "Create user successful"
  );
});

module.exports = userController;

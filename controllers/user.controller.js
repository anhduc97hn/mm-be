const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password, isMentor } = req.body;

  let user = await User.findOne({ email });
  if (user) throw new AppError(HTTP_STATUS.CONFLICT, "User already exists", ERROR_TYPES.CONFLICT);

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // create a new record in User collection
  user = await User.create({
    email,
    password,
  });
  const accessToken = await user.generateToken();

  // create a new record in UserProfile collection

  const userProfile = await UserProfile.create({
    userId: user._id,
    isMentor,
    name,
  });

  await userProfile.populate("userId");

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { userProfile, accessToken },
    null,
    "Create user successful"
  );
});

module.exports = userController;

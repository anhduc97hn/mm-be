const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const authController = {};
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD; 

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

authController.loginWithGoogle = catchAsync(async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client(process.env.CLIENT_ID);
  const response = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });

  if (!response)
    return next(
      new AppError(
        HTTP_STATUS.SERVER_ERROR,
        "Can't connect with your Google account",
        ERROR_TYPES.SERVER_ERROR
      )
    );

  const { email_verified, name, email } = response.payload;

  if (!email_verified)
    return next(
      new AppError(
        HTTP_STATUS.SERVER_ERROR,
        "Google login failed. Try again",
        ERROR_TYPES.SERVER_ERROR
      )
    );

  const user = await User.findOne({ email });

   // if this email does not register yet => create a new record
  if (!user) {
    let password = email + process.env.JWT_SECRET_KEY;
    const newUser = await User.create({ email, password });
    const accessToken = await newUser.generateToken();

    const userProfile = await UserProfile.create({
      userId: newUser._id,
      name,
      isMentor: false,
    });

    await userProfile.populate("userId")

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      { userProfile, accessToken },
      null,
      "Login successful"
    );
  }

  // if user already uses this email to register
  const accessToken = await user.generateToken();
  const userProfile = await UserProfile.findOne({ userId: user._id }).populate(
    "userId"
  );
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    { userProfile, accessToken },
    null,
    "Login successful"
  );
});

authController.forgotPassword = catchAsync(async (req, res, next) => {
 
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(
        HTTP_STATUS.NOT_FOUND,
        "User with that email does not exist",
        ERROR_TYPES.NOT_FOUND
      )
    );

  const resetToken = await user.generateResetToken();

  let config = {
    service : 'gmail',
    auth : {
        user: EMAIL,
        pass: PASSWORD
    }
  }

  let transporter = nodemailer.createTransport(config);

  const emailData = {
    from: EMAIL,
    to: `${email}`,
    subject: `Password Reset link`,
    text: `Password Reset Link`,
    html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/resetpassword/${resetToken}</p>
            <hr />
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `
  };

 transporter.sendMail(emailData, (err, info) => {
    if (err) {
      console.log("transporter erroMailr", err)
      return next(new AppError(HTTP_STATUS.SERVER_ERROR, "Mail server is not working", ERROR_TYPES.SERVER_ERROR))
    }
    else {
      console.log("info", info)
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        { resetToken },
        null,
        `Email has been sent to ${email}. Follow the instruction to activate your account`
      );
    }
  });
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  let userId;

  jwt.verify(resetToken, process.env.JWT_RESET_PASSWORD, (err, payload) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Expired link. Try again",
            ERROR_TYPES.UNAUTHORIZED
          )
        );
      } else {
        return next(
          new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Link is invalid",
            ERROR_TYPES.UNAUTHORIZED
          )
        );
      }
    }
    userId = payload._id;
  });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(newPassword, salt)

  const user = await User.findByIdAndUpdate(userId, {password: password});

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    user,
    null,
    "Great! Now you can login with your new password"
  );
});

module.exports = authController;

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError } = require("../helper/utils");
const UserProfile = require("../models/UserProfile");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");
const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString)
      return next(
        new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          "Login required",
          ERROR_TYPES.UNAUTHORIZED
        )
      );
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(
            new AppError(
              HTTP_STATUS.UNAUTHORIZED,
              "Token expired",
              ERROR_TYPES.UNAUTHORIZED
            )
          );
        } else {
          return next(
            new AppError(
              HTTP_STATUS.UNAUTHORIZED,
              "Token is invalid",
              ERROR_TYPES.UNAUTHORIZED
            )
          );
        }
      }
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    next(error);
  }
};

authMiddleware.checkUserRoleAccess = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const userProfile = await UserProfile.findOne(
        { userId: userId },
        "+isMentor"
      );

      if (
        (requiredRole === "mentor" && userProfile.isMentor) ||
        (requiredRole === "customer" && !userProfile.isMentor)
      ) {
        next();
      } else {
        return next(
          new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Access denied",
            ERROR_TYPES.UNAUTHORIZED
          )
        );
      }
    } catch (error) {
      next(error);
    }
  };
};

authMiddleware.mentorAccessRequired =
  authMiddleware.checkUserRoleAccess("mentor");
authMiddleware.customerAccessRequired =
  authMiddleware.checkUserRoleAccess("customer");

module.exports = authMiddleware;

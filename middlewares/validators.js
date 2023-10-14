const { sendResponse } = require("../helper/utils");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { HTTP_STATUS, ERROR_TYPES } = require("../helper/constants");

const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" & ");
  return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, false, null, { message }, ERROR_TYPES.UNPROCESSABLE_ENTITY);
};

validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId");
  }
  return true;
};


module.exports = validators;
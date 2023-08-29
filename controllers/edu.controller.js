const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Education = require("../models/Education");
const eduController = {};

eduController.createNewEdu = catchAsync(async (req, res, next) => {
  const { ...eduFields } = req.body;

  let education = await Education.create({
    ...eduFields,
  });

  education = await Education.populate("userProfile");

  return sendResponse(res, 200, true, education, null, "Create new edu successful");
});

eduController.getEdu = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ isDeleted: false }];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Education.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const education = await Education.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("userProfile");

  return sendResponse(
    res,
    200,
    true,
    { education, totalPages, count },
    null,
    ""
  );
});

eduController.updateSingleEdu = catchAsync(async (req, res, next) => {
  const eduId = req.params.id;

  const education = await Education.findById(eduId);
  if (!education)
    throw new AppError(404, "Education not found", "Update Education Error");

  const allows = [...req.body];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      education[field] = req.body[field];
    }
  });

  await education.save();
  return sendResponse(
    res,
    200,
    true,
    education,
    null,
    "Update Education successful"
  );
});

eduController.deleteSingleEdu = catchAsync(async (req, res, next) => {
  const eduId = req.params.id;

  const education = await Education.findOneAndUpdate(
    { _id: eduId },
    { isDeleted: true },
    { new: true }
  );

  if (!education)
    throw new AppError(
      400,
      "Education not found or User not authorized",
      "Delete Education Error"
    );

  return sendResponse(
    res,
    200,
    true,
    education,
    null,
    "Delete Education successful"
  );
});

module.exports = eduController;

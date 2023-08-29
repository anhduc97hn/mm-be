const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Experience = require("../models/Experience");
const expController = {};

expController.createNewExp = catchAsync(async (req, res, next) => {
  const { ...expFields } = req.body;

  let experience = await Experience.create({
    ...expFields,
  });

  experience = await Experience.populate("userProfile");

  return sendResponse(res, 200, true, experience, null, "Create new exp successful");
});

expController.getExp = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ isDeleted: false }];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Experience.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const experience = await Experience.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("userProfile");

  return sendResponse(
    res,
    200,
    true,
    { experience, totalPages, count },
    null,
    ""
  );
});

expController.updateSingleExp = catchAsync(async (req, res, next) => {
  const expId = req.params.id;

  const experience = await Experience.findById(expId);
  if (!experience)
    throw new AppError(404, "Experience not found", "Update Experience Error");

  const allows = [...req.body];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      experience[field] = req.body[field];
    }
  });

  await experience.save();
  return sendResponse(
    res,
    200,
    true,
    experience,
    null,
    "Update Experience successful"
  );
});

expController.deleteSingleExp = catchAsync(async (req, res, next) => {
  const expId = req.params.id;

  const experience = await Experience.findOneAndUpdate(
    { _id: expId },
    { isDeleted: true },
    { new: true }
  );

  if (!experience)
    throw new AppError(
      400,
      "Experience not found or User not authorized",
      "Delete Experience Error"
    );

  return sendResponse(
    res,
    200,
    true,
    experience,
    null,
    "Delete Experience successful"
  );
});

module.exports = expController;

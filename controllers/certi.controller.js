const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Certification = require("../models/Certification");
const certiController = {};

certiController.createNewCerti = catchAsync(async (req, res, next) => {
  const { ...certiFields } = req.body;

  let certification = await Certification.create({
    ...certiFields,
  });

  certification = await Certification.populate("userProfile");

  return sendResponse(res, 200, true, certification, null, "Create new certi successful");
});

certiController.getCerti = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ isDeleted: false }];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Certification.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const certification = await Certification.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("userProfile");

  return sendResponse(
    res,
    200,
    true,
    { certification, totalPages, count },
    null,
    ""
  );
});

certiController.updateSingleCerti = catchAsync(async (req, res, next) => {
  const certiId = req.params.id;

  const certification = await Certification.findById(certiId);
  if (!certification)
    throw new AppError(404, "Certification not found", "Update Certification Error");

  const allows = [...req.body];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      certification[field] = req.body[field];
    }
  });

  await certification.save();
  return sendResponse(
    res,
    200,
    true,
    certification,
    null,
    "Update Certification successful"
  );
});

certiController.deleteSingleCerti = catchAsync(async (req, res, next) => {
  const certiId = req.params.id;

  const certification = await Certification.findOneAndUpdate(
    { _id: certiId },
    { isDeleted: true },
    { new: true }
  );

  if (!certification)
    throw new AppError(
      400,
      "Certification not found or User not authorized",
      "Delete Certification Error"
    );

  return sendResponse(
    res,
    200,
    true,
    certification,
    null,
    "Delete Certification successful"
  );
});

module.exports = certiController;

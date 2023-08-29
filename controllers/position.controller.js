const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Position = require("../models/Position");
const positionController = {};

positionController.createNewPosition = catchAsync(async (req, res, next) => {
  const { ...positionFields } = req.body;
//   checking expId here. 

  let position = await Position.create({
    ...positionFields,
  });

  position = await Position.populate("experience");

  return sendResponse(res, 200, true, position, null, "Create new position successful");
});

positionController.getPositions = catchAsync(async (req, res, next) => {
// query positions along with expId => update filterConditions ?
 
  const filterConditions = [{ isDeleted: false }];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const positions = await Position.find(filterCrireria)
    .sort({ createdAt: -1 })
    .populate("experience");

  return sendResponse(
    res,
    200,
    true,
    positions, 
    null,
    ""
  );
});

positionController.updateSinglePosition = catchAsync(async (req, res, next) => {
  const positionId = req.params.id;

  const position = await Position.findById(positionId);
  if (!position)
    throw new AppError(404, "Position not found", "Update Position Error");

  const allows = [...req.body];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      position[field] = req.body[field];
    }
  });

  await position.save();
  return sendResponse(
    res,
    200,
    true,
    position,
    null,
    "Update Position successful"
  );
});

positionController.deleteSinglePosition = catchAsync(async (req, res, next) => {
  const positionId = req.params.id;

  const position = await Position.findOneAndUpdate(
    { _id: positionId },
    { isDeleted: true },
    { new: true }
  );

  if (!position)
    throw new AppError(
      400,
      "Position not found or User not authorized",
      "Delete Position Error"
    );

  return sendResponse(
    res,
    200,
    true,
    position,
    null,
    "Delete Position successful"
  );
});

module.exports = positionController;

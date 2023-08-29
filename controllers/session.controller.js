const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Session = require("../models/Session");
const UserProfile = require("../models/UserProfile");
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

const fs = require("fs");
const credentialsPath = "./credentials.json";

const credentialsData = fs.readFileSync(credentialsPath, "utf8");
const credentials = JSON.parse(credentialsData);

const sessionController = {};

const calculateSessionCount = async (userId) => {
  const sessionCount = await Session.countDocuments({
    $or: [
      {
        status: "completed",
      },
      { status: "reviewed" },
    ],
  });
  await UserProfile.findOneAndUpdate(
    { userId: userId },
    { sessionCount: sessionCount }
  );
};

const createGoogleMeetEvent = async (session) => {
  const gEvent = {
    summary: session.topic,
    description: session.problem,
    start: {
      dateTime: session.startDateTime,
      timeZone: "UTC", // Adjust timezone as needed
    },
    end: {
      dateTime: session.endDateTime,
      timeZone: "UTC", // Adjust timezone as needed
    },
    attendees: [{ email: session.toEmail }, { email: session.fromEmail }],
    reminders: {
      useDefault: true,
      overrides: [{ method: "popup" | "email", minutes: number }],
    },
    sendUpdates: "all" | "externalOnly" | "none",
  };

  // create client that we can use to communicate with Google
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      // set the right scope
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });

  const calendar = google.calendar({ version: "v3" });

  const response = await calendar.events.insert({
    calendarId: "primary",
    auth: client,
    requestBody: gEvent,
  });

  console.log("response", response);
  return response.data;
};

sessionController.sendSessionRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const toUserId = req.params.id; // To
  const { topic, problem, startDateTime, endDateTime } = req.body;

  const mentor = await UserProfile.findOne({ userId: toUserId });
  if (!mentor)
    throw new AppError(400, "Mentor not found", "Send Session Request Error");

  const session = await Session.create({
    from: userId,
    to: toUserId,
    status: "pending",
    topic: topic,
    problem: problem,
    startDateTime: startDateTime,
    endDateTime: endDateTime,
  });

  return sendResponse(res, 200, true, session, null, "Request has ben sent");
});

sessionController.getReceivedSessionRequestList = catchAsync(async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [{ to: userId }, { status: "pending" }];
    if (filter.topic) {
      filterConditions.push({
        ["topic"]: { $regex: filter.topic, $options: "i" },
      });
    }
    const filterCrireria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Session.countDocuments(filterCrireria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const sessions = await Session.find(filterCrireria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("from")
      .populate("userId");

    return sendResponse(
      res,
      200,
      true,
      { sessions, totalPages, count },
      null,
      null
    );
  }
);

sessionController.getSentSessionRequestList = catchAsync(async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [{ from: userId }, { status: "pending" }];
    if (filter.topic) {
      filterConditions.push({
        ["topic"]: { $regex: filter.topic, $options: "i" },
      });
    }
    const filterCrireria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Session.countDocuments(filterCrireria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const sessions = await Session.find(filterCrireria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("to")
      .populate("userId");

    return sendResponse(
      res,
      200,
      true,
      { sessions, totalPages, count },
      null,
      null
    );
  }
);

sessionController.reactSessionRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // To
  const fromUserId = req.params.userId; // From
  const { status, topic, problem, startDateTime, endDateTime } = req.body; // status: accepted | declined

  // to double check this, as it will return an array of sessions. 

  let session = await Session.findOne({
    from: fromUserId,
    to: userId,
    status: "pending",
  });
  if (!session)
    throw new AppError(
      400,
      "Session Request not found",
      "React Friend Request Error"
    );

  session.status = status;

  // call Google api if status is accepted
  if (status === "accepted") {
    const gEventLink = await createGoogleMeetEvent(session);
    session.gEventLink = gEventLink;
  }
  await session.save();

  await calculateSessionCount(userId);
  await calculateSessionCount(fromUserId);

  return sendResponse(
    res,
    200,
    true,
    session,
    null,
    "React Session Request successfully"
  );
});

sessionController.cancelSessionRequest = catchAsync(async (req, res, next) => {
  
  // to double check this as can return an array of sessions.

  const userId = req.userId; // From
  const toUserId = req.params.userId; // To

  const session = await Session.findOneAndUpdate(
    {
      from: userId,
      to: toUserId,
      status: { $in: ["pending", "accepted"] },
    },
    {
      $set: { status: "cancelled" },
    },
    { new: true }
  );

  if (!session)
    throw new AppError(
      400,
      "Session Request not found",
      "Cancel Request Error"
    );

  return sendResponse(
    res,
    200,
    true,
    session,
    null,
    "Session request has been cancelled"
  );
});

sessionController.getSessionList = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ status: { $in: ["completed", "reviewed"] } }];

  if (filter.topic) {
    filterConditions.push({
      ["topic"]: { $regex: filter.name, $options: "i" },
    });
  }

  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Session.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const sessions = await Session.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("from")
    .populate("to")
    .populate("userId");

  return sendResponse(
    res,
    200,
    true,
    { sessions, totalPages, count },
    null,
    null
  );
});

module.exports = sessionController;

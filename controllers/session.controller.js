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

const calculateSessionCount = async (userProfileId) => {
  const filterConditions = [
    {
      to: userProfileId,
      status: "completed",
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const sessionCount = await Session.countDocuments(filterCriteria);
  await UserProfile.findByIdAndUpdate(userProfileId, {
    sessionCount: sessionCount,
  });
};

const createGoogleMeetEvent = async (session) => {

  // send inputs to google api 
  const gEvent = {
    summary: session.topic,
    description: session.problem,
    start: {
      dateTime: session.startDateTime.toISOString(),
      // timeZone: "UTC",
    },
    end: {
      dateTime: session.endDateTime.toISOString(),
      // timeZone: "UTC",
    },
    // Service accounts cannot invite attendees without Domain-Wide Delegation of Authority.'
    // attendees: [], 
    // reminders: {
    //   useDefault: false,
    //   overrides: [{ method: "popup", "minutes": 10}, {method: "email", "minutes": 24 * 60}],
    // },
    // sendUpdates: "all"
  };

  // create client that we can use to communicate with Google
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
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
  // console.log("response.data", response.data);
  return response.data.htmlLink;
};

sessionController.sendSessionRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const { userProfileId } = req.params; // To
  const { topic, problem, startDateTime, endDateTime } = req.body;

  const toUserProfile = await UserProfile.findById(userProfileId);
  if (!toUserProfile )
    throw new AppError(400, "Mentor not found", "Send Session Request Error");

  const fromUserProfile = await UserProfile.findOne({ userId: userId });

  const session = await Session.create({
    from: fromUserProfile._id,
    to: userProfileId,
    status: "pending",
    topic: topic,
    problem: problem,
    startDateTime: startDateTime,
    endDateTime: endDateTime,
  });

  return sendResponse(res, 200, true, session, null, "Request has been sent");
});

sessionController.getReceivedSessionRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const currentUserProfile = await UserProfile.findOne({ userId: userId });

    const filterConditions = [
      { to: currentUserProfile._id },
      { status: "pending" },
    ];
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

sessionController.getSentSessionRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    const currentUserProfile = await UserProfile.findOne({ userId: userId });

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [
      { from: currentUserProfile._id },
      { status: "pending" },
    ];
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
  const userId = req.userId;
  const { sessionId } = req.params;
  const { status } = req.body;  

  let session = await Session.findById(sessionId)

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

  // update session to DB 
  await session.save();

  const toUserProfileId = session.to;

  await calculateSessionCount(toUserProfileId);

  return sendResponse(
    res,
    200,
    true,
    session,
    null,
    "Update Session successfully"
  );
});

sessionController.getSessionList = catchAsync(async (req, res, next) => {
  let { page, limit, status } = req.query;
  let userId = req.userId;

  const userProfile = await UserProfile.findOne({ userId: userId });

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [
    { status: status },
    { $or: [{ from: userProfile._id }, { to: userProfile._id }] },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Session.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const sessions = await Session.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("from")
    .populate("to");

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

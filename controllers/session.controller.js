const { AppError, catchAsync, sendResponse } = require("../helper/utils");
const Session = require("../models/Session");
const UserProfile = require("../models/UserProfile");
const { google } = require("googleapis");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL; 

// OAuth2 client set up 

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

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


sessionController.reactSessionRequest = catchAsync(async (req, res, next) => {
 
  const { sessionId } = req.params;
  const { status } = req.body;  

  let session = await Session.findById(sessionId);

  if (!session)
    throw new AppError(
      400,
      "Session Request not found",
      "React Friend Request Error"
    );
 
  session.status = status;

  // call Google api if status is accepted
  if (status === "accepted") {
    const state = session._id.toString();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: state
    });

    session.gEventLink = url;
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

sessionController.createGoogleEvent = catchAsync(async (req, res, next) => {
  
  const { code, state } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  // Store or use the access and refresh tokens as needed
  oauth2Client.setCredentials(tokens);
 
  const session = await Session.findById(state);
  const fromUserProfile = await UserProfile.findById(session.from).populate(
    "userId"
  );
  const toUserProfile = await UserProfile.findById(session.to).populate(
    "userId"
  );
  const toEmail = toUserProfile.userId.email;
  const fromEmail = fromUserProfile.userId.email;

  // event input
  const gEvent = {
    summary: session.topic,
    description: session.problem,
    start: {
      dateTime: session.startDateTime.toISOString(),
    },
    end: {
      dateTime: session.endDateTime.toISOString(),
    },
    attendees: [{ email: fromEmail }, { email: toEmail }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const calendar = google.calendar({ version: "v3" });

  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    requestBody: gEvent,
  });

  return sendResponse(
    res,
    200,
    true,
    { session },
    null,
    "Create Google Event successfully"
  );
});

module.exports = sessionController;

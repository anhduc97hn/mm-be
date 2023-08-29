const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = Schema(
  {
    from: { type: Schema.Types.ObjectId, required: true, ref: "UserProfile" },
    to: { type: Schema.Types.ObjectId, required: true, ref: "UserProfile" },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled", "reviewed"],
      required: true,
    },
    topic: { type: String, required: true },
    problem: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    gEventLink: { type: String, default: "" },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;

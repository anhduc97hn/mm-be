const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = Schema(
  {
    userProfile: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    company: { type: String, default: "" },
    industry: { type: String, default: "" },
    location: { type: String, default: "" },
    url: { type: String, default: "" },
    position: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      start_date: { type: String, default: "" },
      end_date: { type: String, default: "" },
    },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;

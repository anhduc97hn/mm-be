const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = Schema(
  {
    userProfile: { type: Schema.Types.ObjectId, required: true, ref: "UserProfile" },
    company: { type: String, default: "" },
    industry: { type: String, default: "" },
    location: { type: String, default: "" },
    url: { type: String, default: "" },
    isDeleted: {type: Boolean, default: false, required: true},
    position: { type: Schema.Types.ObjectId, ref: "Position" } 
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;

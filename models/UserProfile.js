const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProfileSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    avatarUrl: { type: String, default: "" },

    aboutMe: { type: String, default: "" },
    city: { type: String, default: "" },
  
    facebookLink: { type: String, default: "" },
    instagramLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    twitterLink: { type: String, default: "" },

    education: { type: Schema.Types.ObjectId, ref: "Education" },
    certifications: { type: Schema.Types.ObjectId, ref: "Certification" },
    experience: { type: Schema.Types.ObjectId, ref: "Experience" },

    currentCompany: { type: String, default: "" },
    currentPosition: { type: String, default: "" },
    sessionCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviewAverageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;

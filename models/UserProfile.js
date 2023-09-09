const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProfileSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    isMentor: { type: Boolean, required: true, default: false},

    avatarUrl: { type: String, default: "" },

    aboutMe: { type: String, default: "" },
    city: { type: String, default: "" },
  
    facebookLink: { type: String, default: "https://www.facebook.com/" },
    instagramLink: { type: String, default: "https://www.instagram.com/" },
    linkedinLink: { type: String, default: "https://www.linkedin.com/" },
    twitterLink: { type: String, default: "https://twitter.com/home" },

    education: [{ type: Schema.Types.ObjectId, ref: "Education" }],
    certifications: [{ type: Schema.Types.ObjectId, ref: "Certification" }],
    experience: [{ type: Schema.Types.ObjectId, ref: "Experience" }],

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

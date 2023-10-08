const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const educationSchema = Schema(
  {
    userProfile: { type: Schema.Types.ObjectId, ref: "UserProfile" },
    degree: { type: String, default: "" },
    end_year: { type: String, default: "" },
    field: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
    isDeleted: {type: Boolean, default: false, required: true}
  },
  { timestamps: true }
);

const Education = mongoose.model("Education", educationSchema);
module.exports = Education;

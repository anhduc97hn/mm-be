const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const certificationSchema = Schema(
  {
    userProfile: { type: Schema.Types.ObjectId, required: true, ref: "UserProfile" },
    meta: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { timestamps: true }
);

const Certification = mongoose.model("Certification", certificationSchema);
module.exports = Certification;

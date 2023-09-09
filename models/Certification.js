const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const certificationSchema = Schema(
  {
    userProfile: { type: Schema.Types.ObjectId, ref: "UserProfile" },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
    isDeleted: {type: Boolean, default: false, required: true}
  },
  { timestamps: true }
);

const Certification = mongoose.model("Certification", certificationSchema);
module.exports = Certification;

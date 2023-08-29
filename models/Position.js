const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = Schema(
  {
    experience: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Experience",
    },
    company: { type: String },

    title: { type: String, default: "" },
    description: { type: String, default: "" },
    start_date: { type: String, default: "" },
    end_date: { type: String, default: "" },
    isDeleted: {type: Boolean, default: false, required: true}
  },
  { timestamps: true }
);

const Position = mongoose.model("Position", positionSchema);
module.exports = Position;

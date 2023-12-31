const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema(
  {
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    session: { type: Schema.Types.ObjectId, required: true, ref: "Session" },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

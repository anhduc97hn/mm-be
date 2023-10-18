require('dotenv').config()

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_RESET_PASSWORD = process.env.JWT_RESET_PASSWORD; 

const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign(
    { _id: this._id, email: this.email },
    JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return accessToken;
};

userSchema.methods.generateResetToken = async function () {
  const resetToken = await jwt.sign(
    { _id: this._id, email: this.email },
    JWT_RESET_PASSWORD,
    {
      expiresIn: "10m",
    }
  );
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

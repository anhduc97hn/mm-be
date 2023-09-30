var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("welcome back");
});

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// userProfileApi
const userProfileApi = require("./userProfile.api");
router.use("/userProfiles", userProfileApi);

// educationApi
const educationApi = require("./education.api");
router.use("/educations", educationApi);

// experienceApi
const experienceApi = require("./experience.api");
router.use("/experiences", experienceApi);

// certificationApi
const certificationApi = require("./certification.api");
router.use("/certifications", certificationApi);

// reviewApi
const reviewApi = require("./review.api");
router.use("/reviews", reviewApi);

// sessionApi
const sessionApi = require("./session.api");
router.use("/sessions", sessionApi);

module.exports = router;

const mongoose = require("mongoose");
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Education = require("./models/Education");
const Experience = require("./models/Experience");
const Certification = require("./models/Certification");
const Review = require("./models/Review");
const Session = require("./models/Session");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

const calculateSessionCount = async (userProfileId) => {
  const filterConditions = [
    {
      $or: [{ to: userProfileId }, { from: userProfileId }],
      status: { $in: ["completed", "reviewed"] },
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

 const sessionCount = await Session.countDocuments(filterCriteria);
 return sessionCount; 
};

const calculateReviewCount = async (userProfileId) => {
  const sessions = await Session.find({
    to: userProfileId,
    status: "reviewed",
  });

  // Count the reviews for these sessions
  const reviewCount = await Review.countDocuments({
    session: { $in: sessions.map((session) => session._id) },
  });

  return reviewCount;
};

const calculateAverageRating = async (userProfileId) => {
  const sessions = await Session.find({
    to: userProfileId,
    status: "reviewed",
  });

  // Find reviews for these sessions
  const reviews = await Review.find({
    session: { $in: sessions.map((session) => session._id) },
  });

  if (reviews.length === 0) {
    // No reviews found, set the average rating to 0 or any default value
    const reviewAverageRating = 0;
    return reviewAverageRating;
  }

  // Calculate the average rating based on reviews
  const ratings = reviews.map((review) => review.rating);
  const reviewAverageRating =
    ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;

  return reviewAverageRating;
};

async function seedDB() {
  try {
    await mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
      })
      .then(() => console.log(`DB connected ${mongoURI}`))
      .catch((err) => console.log(err));

    const collections = [
      User,
      UserProfile,
      Education,
      Experience,
      Certification,
      Review,
      Session,
    ];

    for (const collection of collections) {
      await collection.deleteMany({});
    }

    // Seed User data with Faker
    const userData = Array.from({ length: 20 }, () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
    }));

    const users = await User.insertMany(userData);

    // Seed User background with Faker
    const educationData = Array.from({ length: 20 }, () => ({
      userProfile: null,
      degree: faker.lorem.sentence(5),
      end_year: faker.date.past({
        years: 10,
        refDate: "2020-01-01T00:00:00.000Z",
      }),
      field: faker.person.jobArea(),
      description: faker.lorem.paragraph(),
      url: faker.internet.url(),
    }));

    const education = await Education.insertMany(educationData);

    const experienceData = Array.from({ length: 20 }, () => {
      const end_date = faker.date.past();
      return {
        userProfile: null,
        company: faker.company.name(),
        industry: faker.person.jobArea(),
        location: faker.location.city(),
        url: faker.internet.url(),
        position: {
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraph(),
          start_date: faker.date.past({ years: 5, refDate: `${end_date}` }),
          end_date: end_date,
        },
      };
    });

    const experience = await Experience.insertMany(experienceData);

    const certificationData = Array.from({ length: 20 }, () => ({
      userProfile: null,
      name: faker.lorem.sentence(5),
      description: faker.lorem.paragraph(),
      url: faker.internet.url(),
    }));

    const certification = await Certification.insertMany(certificationData);

    // Seed UserProfile data with references to User, User background and Faker data
    const userProfileData = users.map((user) => {
      const educationIds = education
        .slice(0, faker.number.int({ min: 1, max: 3 }))
        .map((edu) => edu._id);

      const experienceIds = experience
        .slice(0, faker.number.int({ min: 1, max: 10 }))
        .map((exp) => exp._id);

      const certificationIds = certification
        .slice(0, faker.number.int({ min: 1, max: 20 }))
        .map((certi) => certi._id);

      return {
        userId: user._id,
        name: faker.person.fullName(),
        avatarUrl: faker.internet.avatar(),
        aboutMe: faker.person.bio(),
        city: faker.location.city(),
        currentCompany: faker.company.name(),
        currentPosition: faker.person.jobTitle(),
        // sessionCount: faker.number.int({ min: 10, max: 100 }),
        // reviewCount: faker.number.int({ min: 10, max: 100 }),
        // reviewAverageRating: faker.number.float({
        //   min: 1,
        //   max: 5,
        //   precision: 0.1,
        // }),
        education: educationIds,
        experience: experienceIds,
        certifications: certificationIds,
      };
    });

    const userProfile = await UserProfile.insertMany(userProfileData);

    for (let i = 0; i < userProfile.length; i++) {
      const educationIds = userProfile[i].education;
      await Education.updateMany(
        { _id: { $in: educationIds } },
        { $set: { userProfile: userProfile[i]._id } }
      );
    }

    for (let i = 0; i < userProfile.length; i++) {
      const experienceIds = userProfile[i].experience;
      await Experience.updateMany(
        { _id: { $in: experienceIds } },
        { $set: { userProfile: userProfile[i]._id } }
      );
    }

    for (let i = 0; i < userProfile.length; i++) {
      const certificationIds = userProfile[i].certification;
      await Certification.updateMany(
        { _id: { $in: certificationIds } },
        { $set: { userProfile: userProfile[i]._id } }
      );
    }

    // Seed Session

    const sessionData = Array.from({ length: 20 }, () => {
      const startDateTime = faker.date.anytime();
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
      const fromUserProfile =
        userProfile[faker.number.int({ min: 0, max: userProfile.length - 1 })];
      const toUserProfile =
        userProfile[faker.number.int({ min: 0, max: userProfile.length - 1 })];
      return {
        from: fromUserProfile._id,
        to: toUserProfile._id,
        status: "reviewed",
        topic: faker.lorem.sentence(5),
        problem: faker.lorem.sentence(5),
        startDateTime: startDateTime,
        endDateTime: endDateTime,
      };
    });

    const session = await Session.insertMany(sessionData);

    //   Seed Review

    const reviewData = [];

    for (let i = 0; i < session.length; i++) {
      const numReviews = faker.number.int({ min: 1, max: 5 });

      for (let j = 0; j < numReviews; j++) {
        reviewData.push({
          content: faker.lorem.paragraph({ min: 1, max: 3 }),
          rating: faker.number.int({ min: 1, max: 5 }),
          session: session[i]._id,
        });
      }
    }

    await Review.insertMany(reviewData);

    // Populate sessionCount, reviewCount, reviewAverageRating in UserProfile document 
    const userProfiles = await UserProfile.find({});
    const userProfileUpdates = userProfiles.map(async (userProfile) => {
      // Calculate reviewCount
      const reviewCount = await calculateReviewCount(userProfile._id);
      userProfile.reviewCount = reviewCount;

      // Calculate sessionCount
      const sessionCount = await calculateSessionCount(userProfile._id);
      userProfile.sessionCount = sessionCount;

      // Calculate reviewAverageRating
      const reviewAverageRating = await calculateAverageRating(userProfile._id);
      userProfile.reviewAverageRating = reviewAverageRating;

      return userProfile.save();
    });
    await Promise.all(userProfileUpdates);

    console.log("Data seeded successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.disconnect(); // Close the database connection
  }
}

seedDB();

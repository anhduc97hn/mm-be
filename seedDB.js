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

   // Seed UserProfile data with references to User records.
   const userProfileData = users.map((user) => {
    
    return {
      userId: user._id,
      name: faker.person.fullName(),
      avatarUrl: faker.internet.avatar(),
      aboutMe: faker.person.bio(),
      city: faker.location.city(),
      currentCompany: faker.company.name(),
      currentPosition: faker.person.jobTitle(),
      education: [],
      experiences: [],
      certifications: [],
    };
  });

  const userProfile = await UserProfile.insertMany(userProfileData);

    // Seed User background with Faker
    const educationData = Array.from({ length: 40 }, () => ({
      userProfile: userProfile[faker.number.int({ min: 0, max: userProfile.length - 1 })]._id,
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

    const experienceData = Array.from({ length: 40 }, () => {
      const end_date = faker.date.past();
      return {
        userProfile: userProfile[faker.number.int({ min: 0, max: userProfile.length - 1 })]._id,
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

    const experiences = await Experience.insertMany(experienceData);

    const certificationData = Array.from({ length: 40 }, () => ({
      userProfile: userProfile[faker.number.int({ min: 0, max: userProfile.length - 1 })]._id,
      name: faker.lorem.sentence(5),
      description: faker.lorem.paragraph(),
      url: faker.internet.url(),
    }));

    const certifications = await Certification.insertMany(certificationData);

    // Save background records to User Profile

    for (let i = 0; i < userProfile.length; i++) {
      const userEducation = education.filter(
        (edu) => edu.userProfile.toString() === userProfile[i]._id.toString()
      );
      const educationIds = userEducation.map((edu) => edu._id);

      await UserProfile.updateOne(
        { _id: userProfile[i]._id },
        { $set: { education: educationIds } }
      );
    }

    for (let i = 0; i < userProfile.length; i++) {
      const userExperiences = experiences.filter(
        (exp) => exp.userProfile.toString() === userProfile[i]._id.toString()
      );
      const experienceIds = userExperiences.map((exp) => exp._id);

      await UserProfile.updateOne(
        { _id: userProfile[i]._id },
        { $set: { experiences: experienceIds } }
      );
    }

    for (let i = 0; i < userProfile.length; i++) {
      const userCertifications = certifications.filter(
        (certi) => certi.userProfile.toString() === userProfile[i]._id.toString()
      );
      const certificationIds = userCertifications.map((certi) => certi._id);

      await UserProfile.updateOne(
        { _id: userProfile[i]._id },
        { $set: { certifications: certificationIds } }
      );
    }

    // Seed Session

    const sessionData = Array.from({ length: 40 }, () => {
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

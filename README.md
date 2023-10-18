# Description

Mentor match is an app that aims to take user's professional development to a next level where he/she can get instant access and support from a network of qualified professionals in his/her own interests, anywhere, anytime.

# User Stories

## Guests/visitors 
- As a guest, I can browse the list of mentors and search for suitable ones based on certain filters and sortings. 
- As a guest, I can check out mentors’ profiles and reviews 

## Registered customer
- As a customer, I can send/cancel a session request to my desired mentors
- As a customer, I can leave a review after the session is finished
- As a customer, I can receive a google meet link for my upcoming session requests 
- As a customer, I can view and manage all of my session requests in my dashboard
- As a customer, I can update my profile settings 

## Registered mentor
- As a mentor, I can create and update my profile settings 
- As a mentor, I can accept/decline/cancel a session request from customer
- As a mentor, I can receive a google meet link for my upcoming session requests
- As a mentor, I can view and manage all of my session requests in my dashboard 
- As a mentor, I cannot book a session with myself 

# Features and Specifications

## User Authentication
- [x] Mentors and customers can create accounts using their emails
- [x] Registered users can log in and stay signed in for a while
- [x] Registered users can log out

## Browsing mentors
- [x] All users can search for mentors based on name, city, location, company and sort results by review rating, number of sessions and joining date
- [x] All users can view mentors’ profiles and their reviews

## Profile management
- [x] Users can update their account settings, including basic information and their profile avatar 
- [x] Mentors can create and update their  profiles more comprehensively, including other fields such as education, certifications, experiences which will then be displayed on the website. 

## Session management 
- [x] Customer can send/cancel a session request to any mentor
- [x] Mentor can accept/decline/cancel a request from customer
- [x] Both users will have dedicated session dashboards to view status and manage all session requests 
- [x] Google meet link will be provided to users once the mentor accepts the session request.
- [x] Customer is prompted to leave a review on a session after it’s finished.  

# Advanced features

- [x] Auth: forget password
- [x] Auth: sign up/sign in by google credentials
- [x] Session link: google meet to be saved directly to user's google calendar and/or be confirmed with an email sent to user's email address
- [x] Responsive UI

**Deploy link**: https://mentor-match-site.netlify.app/ 

# Schema & ERD

- User
- UserProfile
- Certification
- Education
- Experience 
- Session
- Review

**ERD**: https://drive.google.com/file/d/1A-53mhZX2PiFHzTxw1GbMiehrddgO2Bt/view?usp=sharing

# API Endpoints

## Auth APIs
```
/**
 * @route POST /auth/login
 * @description Log in with email and password
 * @access Public
 */
```
## User APIs
```
/**
 * @route POST /users/signup
 * @description Register new user
 * @access Public
 */
```
## userProfile APIs
```
/**
 * @route GET /userProfiles?page=1&limit=10
 * @description Get userProfiles with pagination
 * @access Public
 */
```
```
/**
 * @route GET /userProfiles/featured?page=1&limit=9
 * @description Get featured mentors on homepage
 * @access Public
 */
```
```
/**
 * @route GET /userProfiles/me
 * @description Get current user info
 * @access Login required
 */
```
```
/**
 * @route GET /userProfiles/:userProfileId
 * @description Get a user profile
 * @access Public
 */
```
```
/**
 * @route PUT /userProfiles/me
 * @description Update user profile
 * @access Login required
 */
```
```
/**
 * @route GET /userProfiles/:userProfileId/reviews
 * @description Get all reviews of a mentor
 * @access Public
 */
```
## Certification APIs
```
/**
 * @route POST /certifications
 * @description Create a new certification
 * @access Login required
 */
```
```
/**
 * @route GET /certifications?page=1&limit=10
 * @description Get all certi of the current user with pagination
 * @access Login required
 */
```
```
/**
 * @route PUT /certifications/:certiId
 * @description Update a certi
 * @access Login required
 */
```
```
/**
 * @route DELETE /certifications/:certiId
 * @description Delete a certi
 * @access Login required
 */
```
## Education APIs
```
/**
 * @route POST /educations
 * @description Create a new education form
 * @access Login required
 */
```
```
/**
 * @route GET /educations?page=1&limit=10
 * @description Get all education of the current user with pagination
 * @access Login required
 */
```
```
/**
 * @route PUT /educations/:educationId
 * @description Update an education
 * @access Login required
 */
```
```
/**
 * @route DELETE /educations/:educationId
 * @description Delete an education
 * @access Login required
 */
```
## Experience APIs
```
/**
 * @route POST /experiences
 * @description Create a new experience
 * @access Login required
 */
```
```
/**
 * @route GET /experiences?page=1&limit=10
 * @description Get all experience of the current user with pagination
 * @access Login required
 */
```
```
/**
 * @route PUT /experiences/:expId
 * @description Update an experience
 * @access Login required
 */
```
```
/**
 * @route DELETE /experiences/:expId
 * @description Delete an experience
 * @access Login required
 */
```
## Session APIs
```
/**
 * @route POST /sessions/:sessionId/reviews
 * @description Create a new review on a session
 * @access Login required
 */
```
```
/**
 * @route POST /sessions/requests/:userProfileId
 * @description Send a session request
 * @access Login required
 */
```
```
/**
 * @route GET /sessions
 * @description Get the list of sessions based on the status 
 * @access Login required
 */
```
```
/**
 * @route GET /sessions/google/redirect
 * @description Google OAuth2 
 * @access Google auth
 */
```
```
/**
 * @route PUT /sessions/:sessionId
 * @description Update status of a session (accept/decline/cancel/complete/pending/reviewed)
 * @access Login required
 */
```

## Review APIs
```
/**
 * @route GET /reviews/:reviewId
 * @description Get details of a review
 * @access Login required
 */
```

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

require("dotenv").config();
const cors = require("cors");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

const { sendResponse, AppError } =require("./helper/utils.js")
const { HTTP_STATUS, ERROR_TYPES } = require("./helper/constants")

app.use('/', indexRouter);

app.use((req, res, next) => {
  const err = new AppError(HTTP_STATUS.BAD_REQUEST, "Not Found", ERROR_TYPES.BAD_REQUEST);
  next(err);
});

app.use((err, req, res, next) => {
  console.log("ERROR", err);
  return sendResponse(
    res,
    err.statusCode ? err.statusCode : HTTP_STATUS.SERVER_ERROR,
    false,
    null,
    { message: err.message },
    err.isOperational ? err.errorType : ERROR_TYPES.SERVER_ERROR,
  );
});

const mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log(`DB connected ${mongoURI}`))
  .catch((err) => console.log(err));

module.exports = app;

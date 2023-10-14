module.exports = {
  HTTP_STATUS: {
    OK: 200,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    UNAUTHORIZED: 401
  },
  ERROR_TYPES: {
    SERVER_ERROR: "Internal Server Error",
    NOT_FOUND: "Not Found Error",
    BAD_REQUEST: "Invalid or Missing Required Data",
    CONFLICT: "Already Exist Error",
    UNPROCESSABLE_ENTITY: "Validation Error",
    UNAUTHORIZED: "Unauthorized Error"
  },
};

const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/errorhandler.js");

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      //  console.log(req.user.role);

      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resource`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorizeRoles;

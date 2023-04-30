const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/errorhandler.js");

const isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return next(new ErrorHandler("Pleasse Login First", 401));

    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedData) return next(new ErrorHandler("Pleasse Login Firs", 404));
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isAuthenticatedUser;

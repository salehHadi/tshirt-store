const User = require("../models/User");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromiss(async (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization.replace("Bearer ", "");

  if (!token) {
    return next(new CustomError("Loggin to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});
// I might need sometimes to back and nderstand this one below
exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(`the soruce is not allowed to your role`, 402)
      );
    }
    next();
  };
};

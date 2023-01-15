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

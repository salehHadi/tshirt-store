const User = require("../models/User");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const mailHelper = require("../utils/mailHelper");
const cloudinary = require("cloudinary").v2;

exports.signup = BigPromiss(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Photo is required for singing up", 400));
  }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("name, email ams password are required", 400));
  }

  let file = req.files.photo;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  cookieToken(user, res);
});

exports.login = BigPromiss(async (req, res, next) => {
  const { email, password } = req.body;

  // check for email or password
  if (!email || !password) {
    return next(new CustomError("please provide email and password"), 400);
  }

  // get user data from the database
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new CustomError("email or password does not match or exsist.", 400)
    );
  }

  // check if the password is valid
  const isPasswordCorrect = await user.isValidatedPassword(password);
  if (!isPasswordCorrect) {
    return next(
      new CustomError("email or password does not match or exsist", 400)
    );
  }
  // generate cookie and token
  cookieToken(user, res);
});

exports.logout = BigPromiss(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logout is completed",
  });
});

exports.forgotPassword = BigPromiss(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError(`email is not exssist or typed it wrong`, 400));
  }

  const forgotToken = user.generateForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  // he said req.get("host"): is better because it gave me full host name ||req.hostname
  const myUrl = `${req.protocol}//${req.get(
    "host"
  )}/password/reset/${forgotToken}`;

  const message = `Cope and past below URL in your browser and hit Enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: `T-store reset Password`, // Subject line
      message: message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfuly`,
    });
  } catch (error) {
    (user.forgotPasswordToken = undefined),
      (user.forgotPasswordExpiry = undefined);

    await user.save({ validateBeforeSave: false });

    return next(new CustomError(error.message, 500));
  }
});

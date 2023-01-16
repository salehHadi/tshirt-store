const User = require("../models/User");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const mailHelper = require("../utils/mailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

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
  )}/api/v1/password/reset/${forgotToken}`;

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

exports.passwordReset = BigPromiss(async (req, res, next) => {
  const token = req.params.token;

  const encrypToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encrypToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError(`Token is invalied or expired`), 400);
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new CustomError(`password is not match`), 400);
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  cookieToken(user, res);
});

exports.getLoggedInUserDetailes = BigPromiss(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromiss(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isOldPasswordCorrect = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isOldPasswordCorrect) {
    return next(new CustomError(`the oldPassword is not match`, 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromiss(async (req, res, next) => {
  if (!req.body.name || !req.body.email) {
    return next(new CustomError(`email and name is required to have `, 401));
  }
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);

    const imageId = user.photo.id;

    // delet the photo from cloudinary
    const resp = await cloudinary.uploader.destroy(imageId);
    // upload new photo to clodinary
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminAllUser = BigPromiss(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetSingleUser = BigPromiss(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError(`user not found`), 400);
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromiss(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOneUser = BigPromiss(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError(`user are not definde`, 400));
  }

  await cloudinary.uploader.destroy(user.photo.id);
  await user.delete();

  res.status(200).json({
    success: true,
    message: `user ${user.email} has been deleted`,
  });
});

exports.managerAllUser = BigPromiss(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

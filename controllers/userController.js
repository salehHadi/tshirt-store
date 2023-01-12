const User = require("../models/User");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

exports.signup = BigPromiss(async (req, res, next) => {
  let result;

  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.uploader.upload(file, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("name, email ams password are required", 400));
  }

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

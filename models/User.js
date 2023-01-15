const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the name"],
    maxlength: [40],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "please type valied email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "it seems you missed something"],
    minlength: [6, `Password should not be less than 8 char`],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: String,
  createAt: {
    type: Date,
    default: Date.now,
  },
});

// bcrypt Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hash password with strength of 10
  this.password = await bcrypt.hash(this.password, 10);
});

// validate Password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password);
};

// create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generate fogot passwprd token
userSchema.methods.generateForgotPasswordToken = function () {
  // generate a long random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // generat a hash - make sure to get a hash n backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // time of token
  this.forgotPasswordExpiry = Date.now() * 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("user", userSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provider product name"],
    trim: true,
    maxlength: [120, "product name should be less that 120 caracters"],
  },
  price: {
    type: Number,
    required: true,
    maxlength: [6, "product price should be less that 6 digits"],
  },
  description: {
    type: String,
    required: [true, "please write your product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "please selecte one of the following category: shortsleeves, longsleeves, sweatshirt and hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "please select from this category:  short-sleeves, long-sleeves, sweat-shirt and hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "please write your Brand name"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  numberOfReview: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Produc", productSchema);

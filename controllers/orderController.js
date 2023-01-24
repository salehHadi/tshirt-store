const Order = require("../models/Order");
const Product = require("../models/Product");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");

exports.createOrder = BigPromiss(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    ShippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    ShippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

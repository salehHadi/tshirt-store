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

exports.getOneOrder = BigPromiss(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("not order under this id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInUserOrder = BigPromiss(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("not order under this id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.deleteOneOrder = BigPromiss(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("not order under this id", 401));
  }

  order.remove();

  res.status(200).json({
    success: true,
  });
});

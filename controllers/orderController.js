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

// admin routes
exports.adminGetAllOrders = BigPromiss(async (req, res, next) => {
  const orders = await Order.find({});

  if (!orders) {
    return next(new CustomError("not order been submit", 401));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOneOrder = BigPromiss(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new CustomError("order is delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

exports.adminDeleteOneOrder = BigPromiss(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("not order under this id", 401));
  }

  order.remove();

  res.status(200).json({
    success: true,
  });
});

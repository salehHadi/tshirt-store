const Product = require("../models/Product");
const BigPromiss = require("../middlewares/bigPromiss");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = BigPromiss(async (req, res, next) => {
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError(`Product image is required `, 401));
  }
  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "product",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getOneProduct = BigPromiss(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError(`no product found with this id`, 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromiss(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const productsObj = await new WhereClause(
    Product.find({}),
    req.query
  ).search();
  // I commint the filter for a while because I have a bug
  // .filter();

  let products = await productsObj.base;
  const filterProductNumber = products.length;

  productsObj.pager(resultPerPage);

  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filterProductNumber,
    totalProductCount,
  });
});

exports.addReview = BigPromiss(async (req, res, next) => {
  const { comment, rating, productId } = req.body;

  const review = {
    user: req.body._id,
    name: req.body.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        (review.comment = comment), (review.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReview = product.reviews.length;
  }

  // adjust product ratings
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromiss(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReview = reviews.length;

  // adjust product ratings
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      rating,
      numberOfReview,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOnlyReviewsForOneProduct = BigPromiss(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// admin only
exports.adminGetAllProduct = BigPromiss(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = BigPromiss(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError(`no product found with this id`, 401));
  }

  const imageArray = [];
  if (req.files) {
    // destroy photos
    for (let i = 0; i < product.photos.length; i++) {
      const res = await cloudinary.uploader.destroy(product.photos[i].id);
    }

    // update photos
    const photos = req.files.photos;
    for (let i = 0; i < photos.length; i++) {
      let result = await cloudinary.uploader.upload(photos[i].tempFilePath, {
        folder: "product", // folder name => .env
      });

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photo = imageArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromiss(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError(`no product found with this id`, 401));
  }

  // destroy photos
  for (let i = 0; i < product.photos.length; i++) {
    const res = await cloudinary.uploader.destroy(product.photos[i].id);
  }

  product.remove();

  res.status(200).json({
    success: true,
    message: "product was deleted!",
  });
});

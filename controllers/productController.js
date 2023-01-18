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
});

exports.getAllProducts = BigPromiss(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const products = new WhereClause(Product.find({}), req.query)
    .search()
    .filter();

  const filterProductNumber = products.length;

  products.pager(resultPerPage);

  products = await products.base;

  res.status(200).json({
    success: true,
    products,
    filterProductNumber,
    totalProductCount,
  });
});

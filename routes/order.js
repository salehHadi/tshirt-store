const express = require("express");
const {
  createOrder,
  getOneOrder,
  deleteOneOrder,
  getLoggedInUserOrder,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router
  .route("/order/:id")
  .get(isLoggedIn, getOneOrder)
  .delete(isLoggedIn, deleteOneOrder);

router.route("/myorder").get(isLoggedIn, getLoggedInUserOrder);
module.exports = router;

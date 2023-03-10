const express = require("express");
const {
  createOrder,
  getOneOrder,
  adminUpdateOneOrder,
  adminDeleteOneOrder,
  getLoggedInUserOrder,
  adminGetAllOrders,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);

router.route("/myorder").get(isLoggedIn, getLoggedInUserOrder);

//admin routs
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);

router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneOrder);
module.exports = router;

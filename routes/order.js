const express = require("express");
const {
  createOrder,
  getOneOrder,
  deleteOneOrder,
  getLoggedInUserOrder,
  adminGetAllOrders,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router
  .route("/order/:id")
  .get(isLoggedIn, getOneOrder)
  .delete(isLoggedIn, deleteOneOrder);

router.route("/myorder").get(isLoggedIn, getLoggedInUserOrder);

//admin routs
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);
module.exports = router;

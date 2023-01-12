const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/userController");

router.route("/singup").post(signup);

module.exports = router;

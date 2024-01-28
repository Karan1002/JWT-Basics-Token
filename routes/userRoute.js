const express = require("express");
const router = express.Router();
const app = express();

const {
  userLogin,
  userRegistration,
} = require("../controllers/userController");
//public
router.route("/register").post(userRegistration);
router.route("/login").post(userLogin);

//protected
module.exports = router;

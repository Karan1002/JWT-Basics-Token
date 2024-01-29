const express = require("express");
const router = express.Router();
const app = express();
const checkUserAuth = require("../middlewares/authMiddleware");

const {
  userLogin,
  userRegistration,
  passwordChange,
  loggedUserData,
  sendUserPasswordResetEmail,
  userResetPassword,
} = require("../controllers/userController");
//public
router.route("/register").post(userRegistration);
router.route("/login").post(userLogin);

router.route("/send-reset-password-email").post(sendUserPasswordResetEmail);

router.route("/reset-password/:id/:token").post(userResetPassword);

//protected
router.use("/changepwd", checkUserAuth);
router.route("/changepwd").post(passwordChange);

router.use("/loggeduserdata", checkUserAuth);
router.route("/loggeduserdata").get(loggedUserData);

module.exports = router;

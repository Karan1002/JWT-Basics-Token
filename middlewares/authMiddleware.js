const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      //   console.log(token);
      //verify
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //get user from token
      req.user = await userModel.findById(userID).select("-password");
      next();
    } catch (error) {
      res.json({ msg: "failed unauthorize user" });
    }
  }
  if (!token) {
    res.json({ msg: "failed unauthorize user no token" });
  }
};

module.exports = checkUserAuth;

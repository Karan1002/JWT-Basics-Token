const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRegistration = async (req, res) => {
  try {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      res.json({ msg: "user already exist" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const userData = await userModel.create({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            // await userData.save();
            res.json({ userData });
          } catch (error) {
            res.json({ msg: "unable to register" });
          }
        } else {
          res.json({ msg: "password not mach" });
        }
      } else {
        res.json({ msg: "please enter all fields" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const userData = await userModel.findOne({ email: email });
      if (userData != null) {
        const isMatch = await bcrypt.compare(password, userData.password);
        if (userData.email === email && isMatch) {
          res.json({ msg: "login access sucess" });
        } else {
          res.json({ msg: "email or password not valid" });
        }
      } else {
        res.json({ msg: "not registered user" });
      }
    } else {
      res.json({ msg: "plzzz enter userID and password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "unable to login" });
  }
};

module.exports = { userRegistration, userLogin };

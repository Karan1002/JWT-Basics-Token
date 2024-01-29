const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../db/emailConnect");

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
            //generate jwt token
            const saveUserData = await userModel.findOne({ email: email });
            const token = jwt.sign(
              { userID: saveUserData._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "2d" }
            );
            // await userData.save();
            res.json({ userData, token: token, msg: "sucess" });
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
          //generate token
          //   const saveUserData = await userModel.findOne({ email: email });
          const token = jwt.sign(
            { userID: userData._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2d" }
          );
          res.json({ msg: "login access sucess", token: token });
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

const passwordChange = async (req, res) => {
  const { password, password_confirmation } = req.body;
  if (password && password_confirmation) {
    if (password === password_confirmation) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      console.log(req.user._id);
      await userModel.findByIdAndUpdate(req.user._id, {
        $set: { password: hashPassword },
      });
      res.json({ msg: "sucess" });
    } else {
      res.json({ msg: "password not match" });
    }
  } else {
    res.json({ msg: "all fields are required" });
  }
};

const loggedUserData = async (req, res) => {
  try {
    const userData = req.user;
    res.json({ userData });
  } catch (error) {
    console.log(error);
  }
};

const sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const userData = await userModel.findOne({ email: email });
    if (userData) {
      const secret = userData._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: userData._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:3000/api/user/reset/${userData._id}/${token}`;
      console.log(link);

      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userData.email,
        subject: "JWT Auth - Password Reset Link",
        html: `<a href=${link}>Click here </a> to reset your password.`,
      });
      res.json({ msg: "password reset email sent.... check email" });
      // userResetPassword();
    } else {
      res.json({ msg: "email does not exist" });
    }
  } else {
    res.json({ msg: "email is required" });
  }
};

const userResetPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;
  const user = await userModel.findById(id);
  const new_token = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_token);
    if (password && password_confirmation) {
      if (password === password_confirmation) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        await userModel.findByIdAndUpdate(user._id, {
          $set: { password: hashPassword },
        });
        res.json({ msg: "password changed" });
      } else {
        res.json({ msg: "password does not match" });
      }
    } else {
      res.json({ msg: "password required" });
    }
  } catch (error) {
    res.json({ msg: "invaild token" });
  }
};

module.exports = {
  userRegistration,
  userLogin,
  passwordChange,
  loggedUserData,
  sendUserPasswordResetEmail,
  userResetPassword,
};

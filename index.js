require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require("./db/connectDB");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const userRoute = require("./routes/userRoute");

app.use("/api/user", userRoute);
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`server is listening port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();

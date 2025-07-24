const mongoose = require("mongoose");
const { env } = require("../constants/env");

const connectToDatabase = () => {
  mongoose
    .connect(env.MONGO_URL)
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((err) => {
      console.log("DATABASE_CONNECT_ERROR", err);
    });
};

module.exports = { connectToDatabase };

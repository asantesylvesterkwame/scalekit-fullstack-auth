const mongoose = require("mongoose");

const connectToDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((err) => {
      console.log("DATABASE_CONNECT_ERROR", err);
    });
};

module.exports = { connectToDatabase };

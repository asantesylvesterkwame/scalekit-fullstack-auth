const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

module.exports.env = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  SCALEKIT_ENVIRONMENT_URL: process.env.SCALEKIT_ENVIRONMENT_URL,
  SCALEKIT_CLIENT_ID: process.env.SCALEKIT_CLIENT_ID,
  SCALEKIT_CLIENT_SECRET: process.env.SCALEKIT_CLIENT_SECRET,
};

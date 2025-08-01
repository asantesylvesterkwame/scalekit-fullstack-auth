const { Scalekit } = require("@scalekit-sdk/node");
const dotenv = require("dotenv");

dotenv.config();

const scalekit = new Scalekit(
  process.env.SCALEKIT_ENVIRONMENT_URL,
  process.env.SCALEKIT_CLIENT_ID,
  process.env.SCALEKIT_CLIENT_SECRET
);

module.exports = scalekit;

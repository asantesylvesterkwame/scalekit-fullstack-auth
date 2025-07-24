import { env } from "../constants/env";

const { Scalekit } = require("@scalekit-sdk/node");

export let scalekit = new Scalekit(
  env.SCALEKIT_ENVIRONMENT_URL,
  env.SCALEKIT_CLIENT_ID,
  env.SCALEKIT_CLIENT_SECRET
);

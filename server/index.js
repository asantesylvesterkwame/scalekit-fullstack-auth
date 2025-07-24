const express = require("express");
const app = express();
const { env } = require("./constants/env");
const { connectToDatabase } = require("./utils/db");
const port = env.PORT || 8081;

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const app = express();
const { env } = require("./constants/env");
const { connectToDatabase } = require("./utils/db");
const authRoute = require("./routes/auth.routes");
const port = env.PORT || 8081;

connectToDatabase();

app.use("/api/v1/auth", authRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

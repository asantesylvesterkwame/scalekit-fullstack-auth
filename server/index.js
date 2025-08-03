const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const session = require("express-session");
const authRoute = require("./routes/auth.routes");
const { connectToDatabase } = require("./utils/db");

dotenv.config();
const port = process.env.PORT || 8081;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3000/",
    "https://neuralfeed.scalekit.dev",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "strict",
  },
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
  })
);

app.use(cookieParser());
app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  connectToDatabase();
  console.log(`🚀 Server is running on port ${port}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
  console.log(`🔐 Auth endpoint: http://localhost:${port}/api/v1/auth`);
});

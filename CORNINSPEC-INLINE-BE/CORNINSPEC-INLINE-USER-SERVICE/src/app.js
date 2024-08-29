// Import necessary modules
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: '../.env' });

// Check required environment variables
const requiredEnvVars = ["USER_SERVICE_PORT", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "ALLOWED_ORIGINS"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

// Importing custom middleware and models
const authenticateToken = require("./middleware/authenticateToken");

// Import routes
let userRoutes;
let authRoutes;

try {
  userRoutes = require("./routes/userRoutes");
  authRoutes = require("./routes/authRoutes");
} catch (error) {
  console.error("Error importing route files:", error);
  process.exit(1);
}

// Initialize express app
const app = express();

// Apply security-related middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Adjust as needed
    referrerPolicy: { policy: "no-referrer" },
    crossOriginEmbedderPolicy: false,
  })
);

// Configure CORS
const corsOptionsDelegate = (req, callback) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
  const requestOrigin = req.header("Origin");

  let corsOptions;
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

// Apply parsing and logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Apply rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts from this IP, please try again after 15 minutes.",
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/v1/auth/login", authLimiter);
app.use(generalLimiter);

// Register routes
app.use("/v1/users", userRoutes);
app.use("/v1/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Service is running");
});

// 404 error handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Resource not found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal Server Error" : err.message || "An error occurred";
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server
const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Handle unexpected errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  server.close(() => process.exit(1));
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

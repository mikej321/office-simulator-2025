/**
 * Main server file for the Office Simulator 2025 backend.
 * Sets up Express server, middleware, routes, and database connection.
 */

// Import required packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authenticateJWT = require("./middleware/authenticateJWT");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const characterRoutes = require("./routes/character");

console.log("Starting server initialization...");

// Load environment variables from .env file
dotenv.config();
console.log("Environment variables loaded");

/**
 * Express Application
 *
 * Express is a web framework that:
 * - Handles HTTP requests (GET, POST, PUT, DELETE)
 * - Manages middleware (functions that process requests)
 * - Routes requests to appropriate handlers
 * - Sends responses back to clients
 *
 * The app object is our main application instance
 * that we configure with middleware and routes
 */
const app = express();
console.log("Express app created");

// Initialize Prisma client for database operations
const prisma = new PrismaClient();
console.log("Prisma client initialized");

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 *
 * CORS is a security feature implemented by browsers that restricts web pages
 * from making requests to a different domain than the one that served the page.
 *
 * Our configuration:
 * - origin: Specifies which domains can access our API
 *   - http://localhost:5173: Vite's default development server
 *   - http://localhost:5174: Alternative Vite port
 *   - Note: Add production domain when deploying (e.g., Netlify)
 *
 * - credentials: true
 *   - Allows cookies and authentication headers
 *   - Required for our JWT authentication
 *   - If false, would prevent sending auth tokens
 *
 * - methods: Allowed HTTP methods
 *   - GET: Retrieve data
 *   - POST: Create new resources
 *   - PUT: Update existing resources
 *   - DELETE: Remove resources
 *   - OPTIONS: Used in CORS preflight requests
 *     (Browser checks if actual request is allowed)
 *
 * - allowedHeaders: Specifies which headers can be used
 *   - Content-Type: For JSON data
 *   - Authorization: For JWT tokens
 */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
console.log("CORS middleware configured");

/**
 * Body Parsing Middleware
 *
 * express.json(): Parses incoming JSON payloads
 * express.urlencoded(): Parses URL-encoded bodies (form submissions)
 *
 * These middleware functions make the parsed data available in req.body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Body parsing middleware configured");

/**
 * Test Route
 *
 * This route is used for:
 * 1. Health checks to verify server is running
 * 2. Basic connectivity testing
 * 3. Load balancer checks
 *
 * It's kept in server.js because:
 * - It's a fundamental server health check
 * - It doesn't require authentication
 * - It's used by deployment tools and monitoring
 */
app.get("/api/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Server is working" });
});

/**
 * Route Mounting
 *
 * Mounting routes means attaching route handlers to specific URL paths.
 * This is done using app.use() which:
 * 1. Takes a base path (e.g., "/api/auth")
 * 2. Attaches all routes from the specified router to that path
 * 3. Applies any middleware to those routes
 *
 * Example: app.use("/api/auth", authRoutes)
 * - All routes in authRoutes will be prefixed with "/api/auth"
 * - So a route defined as "/login" becomes "/api/auth/login"
 */
app.use("/api/auth", authRoutes);
app.use("/api/game", authenticateJWT, gameRoutes);
app.use("/api/character", authenticateJWT, characterRoutes);

/**
 * Error Handling Middleware
 *
 * This middleware catches any errors that occur in our routes.
 * It's important because:
 * 1. Prevents server crashes from unhandled errors
 * 2. Provides consistent error responses
 * 3. Logs errors for debugging
 * 4. Hides sensitive error details from clients
 *
 * The middleware must have 4 parameters (err, req, res, next)
 * to be recognized as an error handler by Express.
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

/**
 * Server Startup with Error Handling
 *
 * We start the server with error handling to:
 * 1. Catch port binding errors
 * 2. Handle startup failures gracefully
 * 3. Provide clear error messages
 *
 * EADDRINUSE (Error Address In Use):
 * - This error occurs when the port we're trying to use is already occupied
 * - It's in all caps because it's a system error code
 * - Common causes:
 *   - Another instance of the server is running
 *   - The port wasn't properly released
 *   - Another application is using the port
 */
const PORT = process.env.PORT || 5000;
app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    }
  });

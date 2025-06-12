const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authenticateJWT = require("./middleware/authenticateJWT");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const characterRoutes = require("./routes/character");

console.log("Starting server initialization...");

dotenv.config();
console.log("Environment variables loaded");

const app = express();
console.log("Express app created");

const prisma = new PrismaClient();
console.log("Prisma client initialized");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
console.log("CORS middleware configured");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Body parsing middleware configured");

app.get("/api/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Server is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/game", authenticateJWT, gameRoutes);
app.use("/api/character", authenticateJWT, characterRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 8000;
// PORT = 8000;
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
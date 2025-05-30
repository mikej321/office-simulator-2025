const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

console.log("Starting server initialization...");

dotenv.config();
console.log("Environment variables loaded");

const app = express();
console.log("Express app created");

const prisma = new PrismaClient();
console.log("Prisma client initialized");

// Simplified CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
console.log("CORS middleware configured");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Body parsing middleware configured");

// Test route
app.get("/api/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Server is working" });
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Login route
app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("Login attempt:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          characters: {
            include: {
              stats: true,
              gameState: true,
            },
          },
        },
      });

      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("Login successful for user:", email);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          characters: user.characters,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  }
);

// Verify token route
app.get("/api/auth/verify", authenticateJWT, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

// Signup route
app.post(
  "/api/auth/signup",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").notEmpty().withMessage("Character name is required"),
  ],
  async (req, res) => {
    try {
      console.log("Signup attempt:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log("Email already exists:", email);
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Creating user:", email);

      // Create user and initial character
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          characters: {
            create: {
              name,
              stats: {
                create: {
                  fatigue: 100,
                  productivity: 100,
                },
              },
              gameState: {
                create: {
                  currentDay: 1,
                },
              },
            },
          },
        },
      });

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("User created successfully:", user.id);
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server with error handling
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

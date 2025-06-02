/**
 * Authentication routes for user signup and login.
 * Handles:
 * - User registration with email/password
 * - User login with credentials
 * - Token generation for authenticated users
 * - Character creation for new users
 */
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const generateToken = require("../utils/generateToken");
const authenticateJWT = require("../middleware/authenticateJWT");

// Create a new instance of PrismaClient
// This instance will be used to interact with the database
const prisma = new PrismaClient();

/**
 * Verify token route
 * GET /api/auth/verify
 *
 * Verifies if a JWT token is valid and returns user data
 */
router.get("/verify", authenticateJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        characters: user.characters,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Error verifying token" });
  }
});

/**
 * Signup route
 * POST /api/auth/signup
 *
 * Validates and creates a new user account:
 * 1. Validates email format and password length
 * 2. Checks if user already exists
 * 3. Hashes password with bcrypt (10 salt rounds)
 * 4. Creates user in database
 * 5. Generates JWT token
 */
router.post(
  "/signup",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password with 10 salt rounds
      // Higher rounds = more secure but slower
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Generate JWT token for authentication
      const token = generateToken(user.id);

      // Return token and user info (excluding password)
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

/**
 * Login route
 * POST /api/auth/login
 *
 * Authenticates user and returns JWT token:
 * 1. Validates email format and password presence
 * 2. Finds user by email
 * 3. Verifies password using bcrypt
 * 4. Generates JWT token
 * 5. Returns token and user info with characters
 */
router.post(
  "/login",
  [
    // Validate email format
    body("email").isEmail().withMessage("Please enter a valid email"),
    // Ensure password is provided
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include their characters
      // The include option tells Prisma to also fetch related data
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
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Return token, user info, and character data
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

module.exports = router;

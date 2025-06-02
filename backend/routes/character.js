/**
 * Character Routes
 *
 * Handles all character-related operations:
 * - Character creation with initial stats
 * - Listing user's characters
 * - Deleting characters
 *
 * All routes require JWT authentication (handled by middleware)
 */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * POST /api/character/create
 *
 * Creates a new character for the authenticated user:
 * 1. Validates character name and initial stats
 * 2. Creates character record with associated stats and game state
 * 3. Returns the created character with all related data
 *
 * Required fields in request body:
 * - name: Character name (string)
 * - mentalPoints: Initial mental points (integer >= 1)
 * - energyLevel: Initial energy level (integer >= 1)
 * - motivationLevel: Initial motivation level (integer >= 1)
 * - focusLevel: Initial focus level (integer >= 1)
 */
router.post(
  "/create",
  [
    body("name").notEmpty().withMessage("Character name is required"),
    body("mentalPoints").isInt({ min: 1 }),
    body("energyLevel").isInt({ min: 1 }),
    body("motivationLevel").isInt({ min: 1 }),
    body("focusLevel").isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const userId = req.user.id;
      const { name, mentalPoints, energyLevel, motivationLevel, focusLevel } =
        req.body;
      // Create character, stats, and game state
      const character = await prisma.character.create({
        data: {
          name,
          user: { connect: { id: userId } },
          stats: {
            create: {
              mentalPoints: Number(mentalPoints),
              energyLevel: Number(energyLevel),
              motivationLevel: Number(motivationLevel),
              focusLevel: Number(focusLevel),
            },
          },
          gameState: {
            create: {
              wins: 0,
              losses: 0,
              projectProgress: 0,
              workDayCount: 0,
              workDayLimit: 5,
              workDayLimitReached: false,
              actionsUsed: 0,
              currentScene: "TestScene", // Start in TestScene
            },
          },
        },
        include: {
          stats: true,
          gameState: true,
        },
      });
      res.status(201).json({ character });
    } catch (error) {
      console.error("Character creation error:", error);
      res.status(500).json({ message: "Error creating character" });
    }
  }
);

/**
 * GET /api/character/list
 *
 * Retrieves all characters for the authenticated user:
 * 1. Gets user ID from JWT token
 * 2. Fetches all characters with their stats and game state
 * 3. Returns array of character data
 *
 * Returns:
 * - Array of character objects, each containing:
 *   - Character details (id, name)
 *   - Associated stats (mentalPoints, energyLevel, etc.)
 *   - Game state (wins, losses, progress, etc.)
 */
router.get("/list", async (req, res) => {
  try {
    const userId = req.user.id;
    const characters = await prisma.character.findMany({
      where: { userId },
      include: {
        stats: true,
        gameState: true,
      },
    });
    res.json({ characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: "Error fetching characters" });
  }
});

/**
 * DELETE /api/character/:id
 *
 * Deletes a specific character if it belongs to the authenticated user:
 * 1. Gets user ID from JWT token
 * 2. Verifies character ownership
 * 3. Deletes character if authorized
 *
 * Parameters:
 * - id: Character ID in URL parameter
 *
 * Security:
 * - Checks character ownership before deletion
 * - Returns 403 if user doesn't own the character
 */
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const charId = parseInt(req.params.id, 10);
    // Check ownership
    const character = await prisma.character.findUnique({
      where: { id: charId },
    });
    if (!character || character.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this character" });
    }
    await prisma.character.delete({ where: { id: charId } });
    res.json({ message: "Character deleted" });
  } catch (error) {
    console.error("Error deleting character:", error);
    res.status(500).json({ message: "Error deleting character" });
  }
});

module.exports = router;

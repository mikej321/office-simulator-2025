const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authenticateJWT = require("../middleware/authenticateJWT");
const prisma = new PrismaClient();

router.get("/save/latest", authenticateJWT, async (req, res) => {
  try {
    const { characterId } = req.query;
    if (!characterId) {
      return res.status(400).json({ message: "Missing characterId" });
    }

    // Find character with related data
    const character = await prisma.character.findUnique({
      where: {
        // Convert characterId to number because query params are strings
        id: parseInt(characterId),
      },
      include: {
        stats: true,
        gameState: true,
      },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // The spread operator (...) combines objects    
    res.json({
      ...character.stats,
      ...character.gameState,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/save", authenticateJWT, async (req, res) => {
  try {
    const {
      characterId,
      mentalPoints,
      energyLevel,
      motivationLevel,
      focusLevel,
      workDayCount,
      actionsUsed,
    } = req.body;
    if (!characterId)
      return res.status(400).json({ message: "Missing characterId" });

    // Update stats
    await prisma.stats.update({
      where: {
        // Convert characterId to number because it might be a string
        characterId: parseInt(characterId),
      },
      data: {
        mentalPoints,
        energyLevel,
        motivationLevel,
        focusLevel,
      },
    });

    // Update gameState
    await prisma.gameState.update({
      where: {
        characterId: parseInt(characterId),
      },
      data: {
        workDayCount,
        actionsUsed,
        lastSaved: new Date(),
      },
    });

    res.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

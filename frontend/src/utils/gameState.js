// gameState.js
// Utility to get current stats with characterId for saving from Phaser registry

// This function takes a scene parameter and extracts character stats from the Phaser registry
export function getCurrentStatsWithCharacterId(scene) {
  // Safely access the character from the registry using chained && operators
  // This prevents errors if any part of the chain is undefined
  const char =
    scene.game &&
    scene.game.registry &&
    scene.game.registry.get("activeCharacter");

    console.log("Active character from registry:", JSON.stringify(char, null, 2));

  // If no character is found, return an empty object
  if (!char) return {};

  // Destructure the character object to get its properties
  const { id: characterId, stats, gameState } = char;

  // Destructure the stats object to get specific stat values
  const { mentalPoints, energyLevel, motivationLevel, focusLevel } =
    stats || {};

  // Destructure the gameState object to get workDayCount and actionsUsed
  const { workDayCount, actionsUsed = 0 } = gameState || {};

  // Return an object with all the extracted values
  return {
    characterId,
    mentalPoints,
    energyLevel,
    motivationLevel,
    focusLevel,
    workDayCount,
    actionsUsed, // Include actions used in the return
  };
}

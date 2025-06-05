// gameState.js
// Utility functions for managing character stats and game state in the Phaser registry

/**
 * Retrieves current character data from the registry for saving to backend
 * This function is specifically used in the save flow to:
 * 1. Get current stats from registry
 * 2. Compare with last saved stats from SQLite
 * 3. Save only if changes are detected
 *
 * @param {Phaser.Scene} scene - The current scene
 * @returns {Object} Complete character data for save comparison
 */
export const getCharacterSaveData = (scene) => {
  // Safely access the character from the registry using chained && operators
  const char =
    scene.game &&
    scene.game.registry &&
    scene.game.registry.get("activeCharacter");

  // If no character is found, return an empty object
  if (!char) return {};

  return {
    ...char.stats,
    ...char.gameState,
  };
};

/**
 * Retrieves current character stats for gameplay use
 * This function is used during gameplay to:
 * 1. Get current stats for UI display
 * 2. Check stat values for game logic
 * 3. Update stats during gameplay
 *
 * @param {Phaser.Scene} scene - The current scene
 * @returns {Object} Current character stats and game state
 */
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
    actionsUsed,
  };
}

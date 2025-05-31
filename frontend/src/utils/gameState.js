// gameState.js
// Utility to get current stats with characterId for saving from Phaser registry

export function getCurrentStatsWithCharacterId(scene) {
  const char =
    scene.game &&
    scene.game.registry &&
    scene.game.registry.get("activeCharacter");
  console.log("Active character from registry:", JSON.stringify(char, null, 2));
  if (!char) return {};
  const { id: characterId, stats, gameState } = char;
  const { mentalPoints, energyLevel, motivationLevel, focusLevel } =
    stats || {};
  const { workDayCount } = gameState || {};
  return {
    characterId,
    mentalPoints,
    energyLevel,
    motivationLevel,
    focusLevel,
    workDayCount,
  };
}

# Scene State, Save Game, and Pause Menu Guide

## Global State with Phaser Registry

To ensure consistent saving and progress tracking across all scenes, use the Phaser registry to store the current character's stats and progress. **All scenes must always read and update stats from the registry—never set or guess stat values when a scene loads.**

## Data Flow Overview

- **Character Creation:**
  - Initial stats are set in both the registry and SQLite (backend DB).
- **During Gameplay:**
  - All stat changes are made to the registry only.
- **Saving Progress:**
  - The current registry values are written to SQLite.
- **Loading a Character:**
  - Values from SQLite are loaded into the registry. All scenes must use the registry for all stat reads/updates.

## Loading Character Data from SQLite into the Registry

When a player loads a character, fetch the character's stats from SQLite (via your backend API), then set those values in the registry:

```js
// Example: after fetching characterData from backend
this.game.registry.set("activeCharacter", {
  id: characterData.id,
  mentalPoints: characterData.mentalPoints,
  energyLevel: characterData.energyLevel,
  motivationLevel: characterData.motivationLevel,
  focusLevel: characterData.focusLevel,
  workDayCount: characterData.workDayCount,
  // ...any other fields
});
```

**Never manually set or guess stat values in a scene. Always pull from the registry!**

## Setting Up the Registry on Character Creation

When a character is created, set all relevant fields in the registry and also save them to SQLite:

```js
this.game.registry.set("activeCharacter", {
  id: characterId,
  mentalPoints: 3,
  energyLevel: 3,
  motivationLevel: 3,
  focusLevel: 3,
  workDayCount: 1,
  // ...add any other fields you want to track
});
// Also send these values to your backend to save in SQLite
```

## Updating Progress in Scenes

Whenever a stat or progress value changes in a scene, update the registry:

```js
const char = this.game.registry.get("activeCharacter");
char.mentalPoints += 1; // or any other update
this.game.registry.set("activeCharacter", char);
```

## Saving Progress

Use the `getCurrentStatsWithCharacterId` utility to always pull the latest values from the registry:

```js
import { getCurrentStatsWithCharacterId } from "../utils/gameState";
const currentStats = getCurrentStatsWithCharacterId(this);
await saveProgress(currentStats, token); // This writes registry values to SQLite
```

## Adding the Pause Menu

Import and instantiate the PauseMenu in your scene:

```js
import PauseMenu from "../factories/pauseMenu";
this.pauseMenu = new PauseMenu(this, {
  onSave: async () => {
    const token = localStorage.getItem("token");
    const currentStats = getCurrentStatsWithCharacterId(this);
    await saveProgress(currentStats, token);
  },
  onBack: () => {
    this.scene.start("PlayerMenuScene");
  },
});
```

Show the pause menu with `this.pauseMenu.show()` (e.g., on key press).

## Best Practices

- **Always update the registry when progress changes.**
- **Never store progress only in local scene variables—always sync to the registry.**
- **Never set or guess stat values in a scene; always pull from the registry.**
- Use the provided utilities for saving and popups.
- Add the pause menu to all gameplay scenes for a consistent user experience.

## Example: Updating and Saving in a Scene

```js
// Update stat
const char = this.game.registry.get("activeCharacter");
char.energyLevel -= 1;
this.game.registry.set("activeCharacter", char);

// Save progress
const currentStats = getCurrentStatsWithCharacterId(this);
await saveProgress(currentStats, token);
```

## Verification of Current Implementation

Our actual code follows the workflow described above:

- **Character Creation:**  
  In `CharacterCreationScene`, when a character is created, the initial stats are set in the registry and also sent to the backend (SQLite) via a POST request. The created character is then stored in the registry using:

  ```js
  this.game.registry.set("activeCharacter", data.character);
  ```

- **Loading a Character:**  
  In `LoadGameScene`, when a player selects a character, the character data is fetched from the backend (SQLite) and then set into the registry:

  ```js
  this.game.registry.set("activeCharacter", char);
  ```

  This ensures that all scenes use the registry as the single source of truth.

- **Updating Stats:**  
  All stat changes are made to the registry only. For example, in various scenes, stats are updated using:

  ```js
  const char = this.game.registry.get("activeCharacter");
  char.mentalPoints += 1; // or any other update
  this.game.registry.set("activeCharacter", char);
  ```

- **Saving Progress:**  
  The `getCurrentStatsWithCharacterId` utility is used to pull the latest values from the registry, which are then sent to the backend (SQLite) via the `saveProgress` function.

This implementation ensures that our game state is consistent, reliable, and follows the best practices outlined in this guide.

---

By following this pattern, all developers can ensure that save/load and pause features work reliably across the entire game, and that character stats are always consistent and up-to-date.

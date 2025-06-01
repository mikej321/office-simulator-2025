# Game Development Guide: Scene Implementation, State Management, and Core Features

## Quick Checklist for New Scenes

When creating a new scene, ensure you have:

- [ ] Imported and initialized the PauseMenu
- [ ] Added authentication token handling
- [ ] Set up registry access for character stats
- [ ] Implemented proper stat updates through the registry
- [ ] Added save functionality where appropriate
- [ ] Added proper error handling for API calls

## Authentication

### Token Management

```js
// Get token from localStorage
const token = localStorage.getItem("token");

// Use token in API calls
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
```

### Error Handling

```js
try {
  // API call with token
} catch (error) {
  console.error("API Error:", error);
  // Handle unauthorized (401) or other errors
  if (error.status === 401) {
    // Redirect to login or handle token refresh
  }
}
```

## State Management

### Global State with Phaser Registry

The Phaser registry is our single source of truth for character stats and progress. **Never set or guess stat values when a scene loads.**

### Data Flow Overview

1. **Character Creation:**

   - Set initial stats in registry and SQLite
   - Store character ID for future reference

2. **During Gameplay:**

   - All stat changes go to registry only
   - Use registry for all stat reads/updates

3. **Saving Progress:**

   - Registry values are written to SQLite
   - Use `getCurrentStatsWithCharacterId` utility

4. **Loading a Character:**
   - SQLite values are loaded into registry
   - All scenes must use registry for stats

### Registry Operations

```js
// Reading from registry
const char = this.game.registry.get("activeCharacter");

// Updating registry
char.mentalPoints += 1;
this.game.registry.set("activeCharacter", char);

// Getting current stats for saving
import { getCurrentStatsWithCharacterId } from "../utils/gameState";
const currentStats = getCurrentStatsWithCharacterId(this);
```

## Pause Menu Implementation

### Basic Setup

```js
import PauseMenu from "../factories/pauseMenu";

// In create() method:
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

// Show pause menu (e.g., on ESC key)
this.input.keyboard.on("keydown-ESC", () => {
  this.pauseMenu.show();
});
```

## Best Practices

### State Management

- ✅ Always update registry when progress changes
- ✅ Never store progress only in local variables
- ✅ Always pull stats from registry, never guess values
- ✅ Use provided utilities for saving and popups

### Authentication

- ✅ Always include token in API calls
- ✅ Handle 401 errors appropriately
- ✅ Check token validity before operations

### Pause Menu

- ✅ Add to all gameplay scenes
- ✅ Implement consistent save functionality
- ✅ Handle navigation properly

## Common Patterns

### Updating and Saving Stats

```js
// 1. Update stat in registry
const char = this.game.registry.get("activeCharacter");
char.energyLevel -= 1;
this.game.registry.set("activeCharacter", char);

// 2. Save progress
const token = localStorage.getItem("token");
const currentStats = getCurrentStatsWithCharacterId(this);
await saveProgress(currentStats, token);
```

### Loading Character Data

```js
// After fetching from backend
this.game.registry.set("activeCharacter", {
  id: characterData.id,
  stats: characterData.stats,
  gameState: characterData.gameState,
});
```

## Error Handling

### API Errors

```js
try {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error("API Error:", error);
  // Handle specific error cases
}
```

### Save Errors

```js
try {
  await saveProgress(currentStats, token);
} catch (error) {
  console.error("Save Error:", error);
  // Show error to user
  this.showPopup("Error saving progress. Please try again.");
}
```

## Verification

Our implementation follows this pattern in:

- `CharacterCreationScene`: Sets initial stats in registry and SQLite
- `LoadGameScene`: Loads character data into registry
- `TestScene`: Updates stats and implements save functionality
- All gameplay scenes: Use registry for stats and implement pause menu

## Troubleshooting

Common issues and solutions:

1. **Stats not updating:**

   - Check if you're updating the registry correctly
   - Verify the registry update is happening before save

2. **Save not working:**

   - Verify token is valid
   - Check if stats have actually changed
   - Ensure characterId is included in save data

3. **Pause menu not showing:**
   - Verify PauseMenu is properly imported
   - Check if ESC key is properly bound
   - Ensure scene is not paused already

---

By following these guidelines and using the checklist, developers can ensure consistent implementation of state management, authentication, and pause functionality across all scenes.

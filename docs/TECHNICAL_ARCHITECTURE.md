# Technical Architecture Guide

## Overview

This document provides a comprehensive overview of the Office Simulator 2025 architecture, explaining how different components work together to create a cohesive game experience.

## Table of Contents

1. [Frontend Architecture](#frontend-architecture)
2. [Backend Architecture](#backend-architecture)
3. [Game Engine (Phaser)](#game-engine)
4. [Data Flow](#data-flow)
5. [Authentication Flow](#authentication-flow)
6. [State Management](#state-management)
7. [Save System](#save-system)
8. [Scene Management](#scene-management)
9. [Utilities and Helpers](#utilities)

## Frontend Architecture

### React Integration

- The game is built using React as the main application framework
- Phaser is integrated into React components using a custom wrapper
- Main entry points:
  - `main.jsx`: Application entry point
  - `App.jsx`: Root component that manages game initialization

### Directory Structure

```
frontend/
├── src/
│   ├── phaser/          # Phaser game scenes
│   ├── factories/       # Reusable game objects
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
```

## Backend Architecture

### Server Setup

- Express.js server running on port 8000
- Prisma ORM for database management
- JWT-based authentication
- RESTful API endpoints

### Directory Structure

```
backend/
├── routes/             # API route handlers
├── middleware/         # Custom middleware
├── prisma/            # Database schema and migrations
├── utils/             # Utility functions
└── server.js          # Server entry point
```

## Game Engine (Phaser)

### Core Concepts

1. **Scenes**

   - Independent game states
   - Each scene has its own lifecycle methods
   - Scenes can be paused, resumed, and switched

2. **Game Objects**

   - Sprites, text, buttons, etc.
   - Managed by scenes
   - Can be interactive

3. **Registry**
   - Global state storage
   - Accessible across all scenes
   - Used for character stats and game progress

### Scene Lifecycle

```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Load assets
  }

  create() {
    // Initialize scene
  }

  update() {
    // Game loop
  }
}
```

## Data Flow

### Character Data Flow

1. **Creation**

   ```javascript
   // 1. User creates character
   // 2. Data sent to backend
   // 3. Backend stores in database
   // 4. Data loaded into registry
   this.game.registry.set("activeCharacter", characterData);
   ```

2. **Updates**

   ```javascript
   // 1. Scene updates registry
   const char = this.game.registry.get("activeCharacter");
   char.energyLevel -= 1;
   this.game.registry.set("activeCharacter", char);

   // 2. Save to backend
   await saveProgress(currentStats, token);
   ```

3. **Loading**
   ```javascript
   // 1. Fetch from backend
   // 2. Load into registry
   this.game.registry.set("activeCharacter", characterData);
   ```

## Authentication Flow

### Token Management

1. **Login**

   ```javascript
   // 1. User logs in
   // 2. Backend returns JWT
   // 3. Store in localStorage
   localStorage.setItem("token", token);
   ```

2. **Verification**

   ```javascript
   // 1. Check token on game start
   const token = localStorage.getItem("token");
   if (token) {
     // Verify with backend
     // Start appropriate scene
   }
   ```

3. **API Calls**
   ```javascript
   // Include token in all API calls
   fetch(url, {
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });
   ```

## State Management

### Registry Usage

1. **Character Stats**

   ```javascript
   // Structure in registry
   {
     id: number,
     stats: {
       mentalPoints: number,
       energyLevel: number,
       motivationLevel: number,
       focusLevel: number
     },
     gameState: {
       workDayCount: number,
       projectProgress: number,
       // ...other game state
     }
   }
   ```

2. **Accessing Stats**

   ```javascript
   // Get current stats
   const char = this.game.registry.get("activeCharacter");

   // Update stats
   char.stats.energyLevel -= 1;
   this.game.registry.set("activeCharacter", char);
   ```

## Save System

### Save Flow

1. **Trigger Save**

   ```javascript
   // From pause menu or auto-save
   const currentStats = getCurrentStatsWithCharacterId(this);
   await saveProgress(currentStats, token);
   ```

2. **Backend Processing**

   ```javascript
   // 1. Verify token
   // 2. Update database
   // 3. Return success/failure
   ```

3. **Error Handling**
   ```javascript
   try {
     await saveProgress(currentStats, token);
   } catch (error) {
     // Handle save errors
   }
   ```

## Storage Systems

### SQLite (Server-Side)

- Primary permanent storage
- Lives on the server in a database file
- Handles all persistent game data
- Accessed through our backend API
- Supports complex queries and relationships
- Example:

  ```sql
  -- Storing character data
  INSERT INTO characters (name, stats) VALUES ('John', '{"energy": 100}');

  -- Retrieving character data
  SELECT * FROM characters WHERE id = 1;
  ```

### Phaser Registry (Memory)

- Temporary in-memory storage
- Lives in RAM during game session
- Cleared on page refresh
- Global access across all Phaser scenes
- Used for active game state
- Example:

  ```javascript
  // Storing in registry
  scene.game.registry.set("activeCharacter", characterData);

  // Retrieving from registry
  const char = scene.game.registry.get("activeCharacter");
  ```

### localStorage (Browser)

- Browser-based temporary storage
- Limited to ~5-10MB
- Used as fallback when backend is unavailable
- Persists across page refreshes
- Only stores strings (requires JSON conversion)
- Example:

  ```javascript
  // Storing
  localStorage.setItem("lastSavedStats", JSON.stringify(data));

  // Retrieving
  const data = JSON.parse(localStorage.getItem("lastSavedStats"));
  ```

### Storage Flow

1. Game starts:

   - Load data from SQLite into Phaser Registry
   - If SQLite unavailable, try localStorage

2. During gameplay:

   - All active data lives in Phaser Registry
   - Changes are made to Registry first

3. When saving:

   - Try to save Registry data to SQLite
   - If SQLite fails, fall back to localStorage

4. On page refresh:
   - Registry is cleared
   - Data is reloaded from SQLite
   - If SQLite unavailable, load from localStorage

## Scene Management

### Scene Types

1. **Boot Scene**

   - Initial scene
   - Checks authentication
   - Loads initial assets

2. **Menu Scenes**

   - Main menu
   - Character creation
   - Load game

3. **Gameplay Scenes**
   - Office environment
   - Mini-games
   - Progress tracking

### Scene Transitions

```javascript
// Start new scene
this.scene.start("NextScene");

// Pause current scene
this.scene.pause();

// Resume scene
this.scene.resume();
```

## Utilities

### Game State Utilities

1. **getCurrentStatsWithCharacterId**

   ```javascript
   // Get current stats from registry
   export function getCurrentStatsWithCharacterId(scene) {
     const char = scene.game.registry.get("activeCharacter");
     return {
       characterId: char.id,
       ...char.stats,
       ...char.gameState,
     };
   }
   ```

2. **Save Game Utilities**
   ```javascript
   // Save progress to backend
   export async function saveProgress(currentStats, token) {
     // Save logic
   }
   ```

### UI Utilities

1. **Popup System**

   ```javascript
   // Show popup messages
   export function showPopup(scene, message) {
     // Popup logic
   }
   ```

2. **Pause Menu**
   ```javascript
   // Pause menu factory
   export default class PauseMenu {
     constructor(scene, options) {
       // Pause menu setup
     }
   }
   ```

## Best Practices

### Scene Development

1. Always use registry for state
2. Implement pause menu
3. Handle authentication
4. Proper error handling
5. Save progress appropriately

### Code Organization

1. Keep scenes focused
2. Use factories for reusable objects
3. Centralize utility functions
4. Maintain consistent naming

### Performance

1. Load assets in preload
2. Clean up resources
3. Handle scene transitions properly
4. Manage memory usage

## Common Patterns

### Scene Setup

```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Load assets
  }

  create() {
    // Setup pause menu
    this.pauseMenu = new PauseMenu(this, {
      onSave: async () => {
        const token = localStorage.getItem("token");
        const currentStats = getCurrentStatsWithCharacterId(this);
        await saveProgress(currentStats, token);
      },
    });

    // Setup game objects
  }

  update() {
    // Game loop
  }
}
```

### Stat Updates

```javascript
// Update stat
const char = this.game.registry.get("activeCharacter");
char.stats.energyLevel -= 1;
this.game.registry.set("activeCharacter", char);

// Save progress
const currentStats = getCurrentStatsWithCharacterId(this);
await saveProgress(currentStats, token);
```

## Troubleshooting

### Common Issues

1. **Authentication**

   - Check token validity
   - Verify token in requests
   - Handle 401 errors

2. **Save Issues**

   - Verify character ID
   - Check stat changes
   - Handle save errors

3. **Scene Issues**
   - Check scene transitions
   - Verify asset loading
   - Handle scene cleanup

## Development Workflow

### Adding New Features

1. Create new scene
2. Implement required functionality
3. Add to scene manager
4. Update documentation

### Testing

1. Test scene transitions
2. Verify state management
3. Check save functionality
4. Test error handling

---

This guide provides a comprehensive overview of the game's architecture. For specific implementation details, refer to the individual component documentation.

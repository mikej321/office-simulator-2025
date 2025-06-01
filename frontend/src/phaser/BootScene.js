import Phaser from "phaser";

/**
 * BootScene is the first scene that runs when the game starts.
 * It handles initial authentication and determines which scene to show first.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    // Register this scene with the key "BootScene"
    super("BootScene");
  }

  preload() {
    // Empty preload as this scene doesn't need any assets
    // It's just a gateway to check authentication and route to the appropriate scene
  }

  async create() {
    // Check if user has a stored authentication token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Verify the token with the backend
        const response = await fetch("http://localhost:8000/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          // If token is valid, go directly to the player menu
          this.scene.start("PlayerMenuScene");
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // If no token or invalid token, start with the main menu
    this.scene.start("MainMenuScene");
  }
}

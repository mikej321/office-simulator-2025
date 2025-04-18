import Phaser from "phaser";
import WorkDay from "./WorkDay";
import StatsManager from "../utils/StatsManager";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameOver",
    });
  }

  create() {
    StatsManager.resetWorkDayCount(); // Reset work day count
    const gameWidth = 800;
    const gameHeight = 600;

    // Add a dark background
    this.add.rectangle(
      gameWidth / 2, // Center X
      gameHeight / 2, // Center Y
      gameWidth, // Full width
      gameHeight, // Full height
      0x000000 // Black color
    );

    // Add "GAME OVER" text
    const gameOverText = this.add.text(
      gameWidth / 2,
      gameHeight / 2 - 50,
      "GAME OVER",
      {
        fontSize: "120px", // Larger font size
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#00ff00", // Bright green
        align: "center",
        stroke: "#800080", // Purple stroke
        strokeThickness: 12, // Thicker stroke
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000", // Black shadow
          blur: 10,
          stroke: true,
          fill: true,
        },
      }
    );
    gameOverText.setOrigin(0.5);

    // Add a smaller "Press SPACE to Restart" text
    const instructionText = this.add.text(
      gameWidth / 2,
      gameHeight / 2 + 150,
      "Press SPACE to Restart",
      {
        fontSize: "24px", // Smaller font size
        fontFamily: "Arial",
        fontStyle: "italic",
        color: "#ffffff", // White text
        align: "center",
      }
    );
    instructionText.setOrigin(0.5);

    // Add a key listener for restarting the game
    this.input.keyboard.once("keydown-SPACE", () => {
        StatsManager.resetWorkDayCount(); // Reset work day count
      this.scene.stop("GameOver"); // Stop GameOver scene
      this.scene.start("WorkDay"); // Transition to WorkDay scene
    });
  }
}
import Phaser from "phaser";

export default class BigTom extends Phaser.Scene {
  constructor() {
    super({
      key: "BigTom",
    });
  }

  preload() {
    // Load the BigTom image
    this.load.image("bigTom", "assets/bigtom.png");
  }

  create() {
    const gameWidth = 800;
    const gameHeight = 600;

    //BigTom sprite to the center of the screen
    const bigTom = this.add.image(gameWidth / 2, gameHeight / 2, "bigTom");

   

    //dark rectangle background for the text
    const textBackground = this.add.rectangle(
      gameWidth / 2, // Center X
      gameHeight - 100, // Center Y
      600, // Width
      150, // Height
      0x000000, // Black color
      0.8 // Opacity
    );
    textBackground.setOrigin(0.5);

    
    this.add.text(
      gameWidth / 2,
      gameHeight - 100,
      "Tom died of stress-related causes in his\nsleep last night.\nR.I.P.",
      {
        fontSize: "28px",
        color: "#ffffff", // White text
        fontStyle: "bold",
        align: "center",
        fontFamily: "Arial",
      }
    ).setOrigin(0.5);

    // Add instructions to press SPACE
    this.add.text(
      gameWidth / 2,
      gameHeight - 50,
      "Press SPACE to continue...",
      {
        fontSize: "20px",
        color: "#ffffff", // White text
        fontStyle: "italic",
        align: "center",
        fontFamily: "Arial",
      }
    ).setOrigin(0.5);

    // Add a key listener for transitioning to the GameOver scene
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.stop("BigTom"); // Stop BigTom scene
      this.scene.start("GameOver"); // Transition to GameOver scene
    });
  }
}
import Phaser from "phaser";

export default class MaxPong extends Phaser.Scene {
  constructor() {
    super({
      key: "MaxPong",
    });
  }

  create() {
    const gameWidth = 800;
    const gameHeight = 600;

    // Calculate the position to center the text
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    // Set max width for the text to fit in the screen
    const maxWidth = gameWidth * 0.8; // 80% of the game width

    // Add the "You Lost" text
    const title = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight / 2 - 50,
      "You really spend the entire day playing Pong?\n...\nI'm impressed?",
      {
        fontSize: "32px",  // Adjust the font size here
        color: "#ff0000",
        wordWrap: { width: maxWidth, useAdvancedWrap: true },  // Enable word wrapping with max width
      }
    );
    title.setOrigin(0.5);

    // Add instructions to restart
    const instructions = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight / 2 + 50,
      "Press SPACE to continue",
      {
        fontSize: "24px",
        color: "#ffffff",
        wordWrap: { width: maxWidth, useAdvancedWrap: true },  // Wrap this text too
      }
    );
    instructions.setOrigin(0.5);

    // Add key listener for restarting
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.stop("Pong");
      this.scene.start("EndOfDay");
    });
  }
}

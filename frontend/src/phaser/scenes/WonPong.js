import Phaser from "phaser";

export default class WonPong extends Phaser.Scene {
  constructor() {
    super({
      key: "WonPong",
    });
  }

  create() {
    const gameWidth = 800;
    const gameHeight = 600;

    // Calculate the position to center the text
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    const char = this.game.registry.get("activeCharacter");
    const playerName = char ? char.name : "Tom";
    this.dialog = [
      `Good job ${playerName}! \nYou didn't get any work done, \nbut somehow you still feel productive!`,
      // ... existing dialog lines ...
    ];

    // Add the "You Won" text
    const title = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight / 2 - 50,
      this.dialog[0],
      {
        fontSize: "48px",
        color: "#00ff00",
      }
    );
    title.setOrigin(0.5);

    // Add instructions to continue
    const instructions = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight / 2 + 50,
      "Press SPACE to continue",
      {
        fontSize: "24px",
        color: "#ffffff",
      }
    );
    instructions.setOrigin(0.5);

    // Add key listener for continuing
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.stop("Pong");
      this.scene.start("WorkDay");
    });
  }
}

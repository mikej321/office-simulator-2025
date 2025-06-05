import Phaser from "phaser";

export default class LostPong extends Phaser.Scene {
  constructor() {
    super({
      key: "LostPong",
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
      `Not only did ${playerName} slack off at work today, \nbut he also lost against the pesky ai! \nThis will take a toll on his spirit.`,
      // ... existing dialog lines ...
    ];

    // Add the "You Lost" text
    const title = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight / 2 - 50,
      this.dialog[0],
      {
        fontSize: "48px",
        color: "#ff0000",
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
      }
    );
    instructions.setOrigin(0.5);

    // Add key listener for restarting
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.stop("Pong");
      this.scene.start("WorkDay");
    });
  }
}

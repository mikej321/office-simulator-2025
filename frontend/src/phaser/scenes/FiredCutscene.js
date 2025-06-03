import Phaser from "phaser";

export default class FiredCutscene extends Phaser.Scene {
  constructor() {
    super({ key: "FiredCutscene" });
  }

  preload() {
    this.load.aseprite("firedbg", "assets/firedbg.png", "assets/firedbg.json");
  }

  create() {
    this.anims.create({
      key: "fire_bg_loop",
      frames: this.anims.generateFrameNames("firedbg"), // uses all frames from the Aseprite JSON
      frameRate: 5.5, // adjust speed
      repeat: -1, // -1 = loop forever
    });

    // Add the sprite and play the animation
    this.bg = this.add.sprite(400, 300, "firedbg").setOrigin(0.5, 0.5);
    this.bg.play("fire_bg_loop");

    const char = this.game.registry.get("activeCharacter");
    const playerName = char ? char.name : "Tom";

    this.dialog = [
      `${playerName}.`,
      "Let's not drag this out.",
      "You didn't finish the project.",
      "You missed your deadline.",
      "You spent five days goofing off.",
      "This isn't what we're looking for.",
      "Effective immediately… you're fired.",
    ];

    this.dialogIndex = 0;

    this.dialogBg = this.add
      .rectangle(400, 510, 640, 90, 0xffffff)
      .setOrigin(0.5);
    this.dialogBg.setStrokeStyle(2, 0x000000);

    // Main dialog text
    this.textBox = this.add
      .text(400, 510, this.dialog[this.dialogIndex], {
        fontSize: "24px",
        fontStyle: "Bold",
        color: "#000000",
        wordWrap: { width: 600, useAdvancedWrap: true },
        align: "center",
      })
      .setOrigin(0.5);

    // Helper text (shown only at first)
    this.helperText = this.add
      .text(400, 570, "Press SPACE to continue...", {
        fontSize: "16px",
        fontStyle: "Italic",
        color: "#666666",
        align: "center",
      })
      .setOrigin(0.5);

    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.helperText && this.dialogIndex === 0) {
        this.helperText.destroy();
      }

      this.dialogIndex++;

      if (this.dialogIndex < this.dialog.length) {
        this.textBox.setText(this.dialog[this.dialogIndex]);
      } else if (!this.transitioning) {
        this.transitioning = true;
        const token = localStorage.getItem("token");
        this.scene.start(token ? "PlayerMenuScene" : "MainMenuScene");
      }
    });
  }
}

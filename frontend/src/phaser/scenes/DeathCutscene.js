import Phaser from "phaser";

export default class DeathCutscene extends Phaser.Scene {
  constructor() {
    super({ key: "DeathCutscene" });
  }

  preload() {
    // Load the horizontal sprite sheet
    this.load.spritesheet("deathcutscene", "assets/deathcutscene.png", {
      frameWidth: 800, // Width of one frame
      frameHeight: 600, // Height of one frame
    });
  }

    create() {
        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNumbers("deathcutscene", {
            start: 0,
            end: 65,
            }),
            frameRate: 10,
            repeat: 0,
        });

        const cutscene = this.add.sprite(400, 300, "deathcutscene");

        // Adjust scale to fit screen (experiment with this)
        cutscene.setScale(0.5); // Try 0.5 first; adjust as needed

        cutscene.setOrigin(0.5);
        cutscene.play("death");

        cutscene.on("animationcomplete", () => {
            this.scene.start("MainMenuScene");
        });
    }

}

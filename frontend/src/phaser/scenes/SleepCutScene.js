import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";

export default class SleepCutscene extends Phaser.Scene {
  constructor() {
    super({ key: "SleepCutscene" });
  }

  preload() {
    // Load the horizontal sprite sheet
    this.load.spritesheet("sleepcutscene", "assets/sleepcutscene.png", {
      frameWidth: 800, // Width of one frame
      frameHeight: 600, // Height of one frame
    });
     this.load.audio('rooster', 'assets/rooster.mp3');
  }

    create() {
        this.anims.create({
            key: "sleep",
            frames: this.anims.generateFrameNumbers("sleepcutscene", {
            start: 0,
            end: 19,
            }),
            frameRate: 10,
            repeat: 0,
        });

        const cutscene = this.add.sprite(400, 300, "sleepcutscene");

        // Adjust scale to fit screen (experiment with this)
        cutscene.setScale(1); //adjust as needed

        cutscene.setOrigin(0.5);
        cutscene.play("sleep");

        cutscene.on("animationcomplete", () => {
            // Check if the player has no MP left
            if (StatsManager.getMP() <= 0) {
              this.scene.start("DeathCutscene");
            } else {
              this.sound.play('rooster');
              this.scene.start("Home");
            }
        });
    }
}

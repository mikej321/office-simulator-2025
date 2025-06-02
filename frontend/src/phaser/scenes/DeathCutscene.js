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
    const musicManager = this.scene.get('MusicManager');
    musicManager.stopMusic(); // stop all music

    console.log(this.textures.get('deathcutscene').frameTotal); // should be 66

    this.anims.create({
      key: "death",
      frames: this.generateRowMajorOrder(11, 6), // columns, rows
      frameRate: 10,
      repeat: 0
    });


    const cutscene = this.add.sprite(400, 300, "deathcutscene");


    // Adjust scale to fit screen (experiment with this)
    cutscene.setScale(1.5); //adjust as needed

    cutscene.setOrigin(0.5);
    cutscene.setFrame(0); // Try 0–65 to test visibility
    cutscene.setVisible(true); // Ensure the sprite is visible
    cutscene.setDepth(1000); // Ensure it renders above other elements
    cutscene.play("death");

    cutscene.on("animationcomplete", () => {
        this.scene.start("MainMenuScene");
    });
  }

  generateRowMajorOrder(columns, rows) {
    const frames = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = col * rows + row; // ← flips column-major to row-major
        if (index < columns * rows) {
          frames.push({ key: 'deathcutscene', frame: index });
        }
      }
    }
    return frames;
  }

}

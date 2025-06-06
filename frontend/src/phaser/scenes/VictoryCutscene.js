import Phaser from "phaser";
import MusicManager from "./MusicManager"; // Ensure this path is correct

export default class VictoryCutscene extends Phaser.Scene {
  constructor() {
    super({ key: "VictoryCutscene" });
  }

  preload() {
     this.load.aseprite('victorybg', 'assets/victorybg.png', 'assets/victorybg.json');
  }

  create() {
    if (!this.scene.isActive('MusicManager')) {
      this.scene.launch('MusicManager');
      this.time.delayedCall(100, () => {
        this.scene.get('MusicManager').playTrack('party');
      });
    } else {
      this.scene.get('MusicManager').playTrack('party');
    }
      // Manually create the animation using all frame names
        this.anims.create({
            key: 'victory_bg_loop',
            frames: this.anims.generateFrameNames('victorybg'), // uses all frames from the Aseprite JSON
            frameRate: 5.5, // adjust speed
            repeat: -1     // -1 = loop forever
        });

  // Add the sprite and play the animation
  this.bg = this.add.sprite(400, 300, 'victorybg').setOrigin(0.5, 0.5);
  this.bg.play('victory_bg_loop');

    this.dialog = [
        "Well, well, well... Tom actually pulled it off.",
        "You finished the project. On time. Somehow.",
        "Even Chris is impressed!",
        "Even the boss cracked a smile. (We think.)",
        "Your probation period is officially over.",
        "Congrats, Tom. You’re hired!"
    ];

    this.dialogIndex = 0;

    this.dialogBg = this.add.rectangle(400, 510, 640, 90, 0xffffff).setOrigin(0.5);
    this.dialogBg.setStrokeStyle(2, 0x000000);

    // Main dialog text
    this.textBox = this.add.text(400, 510, this.dialog[this.dialogIndex], {
    fontSize: '24px',
    fontStyle: 'Bold',
    color: '#000000',
    wordWrap: { width: 600, useAdvancedWrap: true },
    align: 'center'
    }).setOrigin(0.5);

    // Helper text (shown only at first)
    this.helperText = this.add.text(400, 570, 'Press SPACE to continue...', {
    fontSize: '16px',
    fontStyle: 'Italic',
    color: '#666666',
    align: 'center'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-SPACE', () => {
        if (this.helperText && this.dialogIndex === 0) {
            this.helperText.destroy();
        }

        this.dialogIndex++;

        if (this.dialogIndex < this.dialog.length) {
            this.textBox.setText(this.dialog[this.dialogIndex]);
        } else if (!this.transitioning) {
            this.transitioning = true;
            this.scene.start('MainMenuScene'); // Transition to the MainMenuScene
        }
    });
  }
}

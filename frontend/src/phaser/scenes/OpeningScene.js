export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super('OpeningScene');
  }

  preload() {
     this.load.aseprite('openingbg', 'assets/openingbg.png', 'assets/openingbg.json');
  }

  create() {
    this.anims.create({
        key: 'bg_loop',
        frames: this.anims.generateFrameNames('openingbg'), // uses all frames from the Aseprite JSON
        frameRate: 5.5, // adjust speed to your liking
        repeat: -1     // -1 = loop forever
    });

    // Add the sprite and play the animation
    this.bg = this.add.sprite(400, 300, 'openingbg').setOrigin(0.5, 0.5);
    this.bg.play('bg_loop');

    this.dialog = [
      "Welcome to the team, Tom!",
      "You're here on a probationary period.",
      "You’ve got 5 days to prove yourself.",
      "Finish the assigned task on time...",
      "...or you're fired.",
      "Good luck. You'll need it."
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
            this.scene.start('TutorialScene'); // Transition to the TutorialScene
        }
    });
  }
}

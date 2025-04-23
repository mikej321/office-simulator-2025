import Phaser, { Scene } from "phaser";

export default class SpeechBubble extends Phaser.GameObjects.Container {
  constructor(scene, x, y, message, style = {}, maxWidth = 200) {
    super(scene, x, y);

    this.padding = 8;
    this.tailHeight = 12;
    this.radius = 6;
    this.maxWidth = maxWidth;

    // 1) Create text with wordWrap
    this.text = scene.add.text(0, 0, message, {
      fontSize: "16px",
      color: "#000",
      align: "left",
      wordWrap: {
        width: maxWidth,
        ...style,
      },
    });

    // 2) Graphics for bubble
    this.bubble = scene.add.graphics();
    this.add([this.bubble, this.text]);
    scene.add.existing(this);

    // draw for the first time
    this.redraw();

    this.setVisible(false);
  }

  // Recalculate sizes and redraw bubble around text
  redraw() {
    const { padding, tailHeight, radius } = this;
    const bounds = this.text.getBounds();

    // total box dimensions
    const w = bounds.width + padding * 2;
    const h = bounds.height + padding * 2;

    // reposition text (centered above tail)
    this.text.setPosition(-w / 2 + padding, -h - tailHeight + padding);

    // clear and draw
    this.bubble.clear();
    this.bubble.fillStyle(0xffffff, 1);
    this.bubble.lineStyle(2, 0x000000, 1);

    // rounded rect
    this.bubble.fillRoundedRect(-w / 2, -h - tailHeight, w, h, radius);

    // tail
    this.bubble.beginPath();
    this.bubble.moveTo(10, -tailHeight);
    this.bubble.lineTo(0, 0);
    this.bubble.closePath();
    this.bubble.fillPath();
  }

  // Change the text (and resize)
  setText(message) {
    this.text.setText(message);
    this.redraw();
  }

  show() {
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }
}

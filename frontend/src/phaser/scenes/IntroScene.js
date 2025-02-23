import Phaser from "phaser";
import WebFont from "webfontloader";

class IntroScene extends Phaser.Scene {
  constructor() {
    super({
      key: "IntroScene",
    });
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x000000);
    // Use atlas instead of spritesheet since the sizes are different
    this.load.atlas(
      "introLaptop",
      "/office-simulator-2025/assets/laptop.png",
      "/office-simulator-2025/assets/laptop.json"
    );

    /* The JSON file contains frame names and coordinates, which you
    can reference by name instead of grid positions */
    this.load.start();
  }

  create() {
    // Creating the laptop that will be the background for the intro scene
    this.introLaptop = this.add.sprite(500, 500, "introLaptop", "start");

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    // Calculate scale based on sprite's original dimensions
    const scaleX = (width + 100) / this.introLaptop.width;
    const scaleY = (height + 100) / this.introLaptop.height;

    // Use the smaller of the two scales to maintain aspect ratio
    const scale = Math.max(scaleX, scaleY);
    this.introLaptop.setScale(scale);

    // Center the background sprite
    const centerX = width / 2 - (this.introLaptop.width * scale) / 2;
    const centerY = height / 2 - (this.introLaptop.height * scale) / 2;

    this.introLaptop.setPosition(centerX, centerY);
    this.introLaptop.setOrigin(0, 0);

    this.introLaptop.setScale(scale);

    // animations
    this.anims.create({
      key: "laptopOpening",
      frames: [
        {
          key: "introLaptop",
          frame: "start",
        },
        {
          key: "introLaptop",
          frame: "opening",
        },
        {
          key: "introLaptop",
          frame: "open",
        },
      ],
      frameRate: 2,
      repeat: 0,
    });

    // plays by anims.create 'key'
    this.introLaptop.play("laptopOpening");

    // get width and height of screen

    // Once the animation is finished, make it static
    this.time.delayedCall(1500, () => {
      // Set the last frame as the static background
      this.introLaptop.setFrame("open");

      // The initial scaling and position of the sprite
      this.updatePosition();

      // Listen for window resize event
      this.scale.on("resize", this.updatePosition, this);
    });
  }

  update() {}

  // helper function to update the position and scale
  updatePosition() {
    // Get the canvas size
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Calculate scale
    const scaleX =
      width < 1000
        ? (width + 100) / this.introLaptop.width
        : (width - 400) / this.introLaptop.width;
    const scaleY =
      height < 1000
        ? (height + 100) / this.introLaptop.height
        : (height - 400) / this.introLaptop.height;

    // Use the smaller scale factor
    const scale = Math.max(scaleX, scaleY);
    this.introLaptop.setScale(scale);

    // Calculate the position to center
    const centerX = width / 2 - (this.introLaptop.width * scale) / 2;
    const centerY = height / 2 - (this.introLaptop.height * scale) / 2;

    // Position the sprite at center
    this.introLaptop.setPosition(centerX, centerY);
  }
}

export default IntroScene;

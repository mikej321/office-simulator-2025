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
      frameRate: 6,
      repeat: 0,
    });

    // plays by anims.create 'key'
    this.introLaptop.play("laptopOpening");
  }

  update() {}
}

export default IntroScene;

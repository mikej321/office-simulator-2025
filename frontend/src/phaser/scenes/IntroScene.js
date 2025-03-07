import Phaser from "phaser";
import WebFont from "webfontloader";

class IntroScene extends Phaser.Scene {
  constructor() {
    super({
      key: "IntroScene",
    });
  }

  preload() {
    // Preparing Fonts
    this.fontsLoaded = false;

    WebFont.load({
      google: {
        families: ["JetBrains Mono:wght@300,400,500,600,700"],
      },
      active: () => {
        console.log("Fonts loaded");
        this.fontsLoaded = true;
        // Add typing function here
      },
      inactive: () => {
        console.error("Font loading failed");
        this.fontsLoaded = true;
        // Add typing function here
      },
    });

    this.cameras.main.setBackgroundColor(0x000000);
    // Use atlas instead of spritesheet since the sizes are different
    this.load.atlas(
      "introLaptop",
      "/office-simulator-2025/assets/modified_laptop.png",
      "/office-simulator-2025/assets/modified_laptop.json"
    );

    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );

    /* The JSON file contains frame names and coordinates, which you
    can reference by name instead of grid positions */
    this.load.start();
  }

  create() {
    // This will be played for scaling at the very beginning of the scene
    this.updateCanvas();
  }

  update() {}

  // helper function to scale the background sprite
  updateCanvas() {
    // Creating the laptop that will be the background for the intro scene
    this.introLaptop = this.add.sprite(500, 500, "introLaptop", "start");

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
          duration: 100,
        },
        {
          key: "introLaptop",
          frame: "opening",
          duration: 2,
        },
        {
          key: "introLaptop",
          frame: "open",
          duration: 2,
        },
        {
          key: "introLaptop",
          frame: "application-1",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-2",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-3",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-4",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-5",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-6",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-7",
          duration: 83,
        },
        {
          key: "introLaptop",
          frame: "application-8",
          duration: 83,
        },
      ],
      frameRate: 7,
      repeat: 0,
    });

    // plays by anims.create 'key'
    this.introLaptop.play("laptopOpening");

    // get width and height of screen

    // Once the animation is finished, make it static
    this.time.delayedCall(1500, () => {
      // Set the last frame as the static background
      this.introLaptop.setFrame("application-8");

      // The initial scaling and position of the sprite
      this.updateSpritePosition();

      // Listen for window resize event
      this.scale.on("resize", this.updateSpritePosition, this);

      // this.createPlayer();
    });
  }

  // helper function to update the position and scale
  updateSpritePosition() {
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

  createPlayer() {
    this.player = this.add.sprite(-100, 400, "player", "frame-1").setScale(3);

    this.anims.create({
      key: "playerMove",
      frames: this.anims.generateFrameNames("player", {
        prefix: "frame-",
        start: 8,
        end: 41,
      }),
      frameRate: 8,
      repeat: 0,
    });

    this.time.delayedCall(500, () => {
      this.player.play("playerMove");

      // Tween to move to middle of the screen
      this.tweens.add({
        targets: this.player,
        x: this.scale.width / 2,
        duration: 4100, // Adjust as needed
        ease: "Linear",
      });
    });
  }
}

export default IntroScene;

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
      "/office-simulator-2025/assets/laptop.png",
      "/office-simulator-2025/assets/laptop.json"
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
      this.updateSpritePosition();

      // Listen for window resize event
      this.scale.on("resize", this.updateSpritePosition, this);

      // Begin the typing animation
      this.typingAnimation();

      // This function will be called after the text has been typed on the screen
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

  typingAnimation() {
    // Center coordinates (may need to change due to canvas being laptop)
    const { width, height } = this.scale;

    // Typing configuration
    if (this.introText) this.introText.destroy();
    this.introText = this.add
      .text(width / 2 - 275, height / 4 - 40, "|", {
        fontSize: "24px",
        color: "#ffffff",
        letterSpacing: 2,
        fontFamily: "JetBrains Mono",
        fontStyle: "Bold",
      })
      .setOrigin(0, 0.5);

    let introTextIndex = 0;
    const introText = 'let name = ""';
    const introTypingSpeed = 80;

    const typeNextLetter = () => {
      if (introTextIndex < introText.length) {
        this.introText.setText(
          introText.substring(0, introTextIndex + 1).replace(/""/, '"|"')
        );
        introTextIndex++;
        this.time.delayedCall(introTypingSpeed, typeNextLetter);
      } else {
        this.introText.setText('let name = "|"');
        this.startCursorBlink(this.introText);
      }
    };

    this.time.delayedCall(500, typeNextLetter);
  }

  startCursorBlink(textObject, stopAfter = false) {
    const blink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const currentText = textObject.text;
        if (currentText.includes("|")) {
          textObject.setText(currentText.replace('"|"', '" "')); // Remove cursor
        } else {
          textObject.setText(currentText.replace('" "', '"|"')); // Add cursor
        }
      },
    });

    if (stopAfter) {
      this.time.delayedCall(500, () => {
        textObject.setText(textObject.text.replace('|"', '"'));
        blink.remove();
      });
    }
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

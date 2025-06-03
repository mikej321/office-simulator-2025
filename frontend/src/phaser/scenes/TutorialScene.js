import Phaser from "phaser";

class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: "TutorialScene" });
    this.dialogIndex = 0;
  }

  preload() {
    this.load.image("tiles", "assets/InteriorTilesLITE.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
  }

  create() {
    // Set up tilemap and background
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("HouseTileSet", "tiles");

    const offsetX = (this.scale.width - 800) / 2;
    const offsetY = (this.scale.height - 600) / 2;

    map.layers.forEach((layerData) => {
      map.createLayer(layerData.name, tileset, offsetX, offsetY);
    });

    // Create the player sprite
    this.createPlayer();

    // Tutorial dialog steps
    this.tutorialText = [
        "This is your apartment. You'll start each day here.",
        "You can move around using the arrow keys on your keyboard.",
        "Walk up to different objects in the apartment and press E to interact.",
        "Every morning, you can do 3 things to prepare for work.",
        "Each choice changes your stats: Energy, Motivation, Focus, and Mental Points.",
        "At work, your goal is to earn 10 Project Progress points within 5 days.",
        "If you succeed, you pass your probation period and keep your job!",
        "Choose wisely, because every decision impacts your performance.",
        "At work, you will also need to manage your time effectively.",
        "After work, you will get feedback on your performance.",
        "Also after work, you come back to your apartment and get to prepare for the next day.",
        "Choose your actions carefully to maximize your stats.",
        "You can press S to see your current stats at any time.",
        "Remember, you have 5 days to prove yourself.",
        "That's it! Let's start your first morning."
    ];

    // UI Elements
    this.dialogBg = this.add.rectangle(580, 520, 600, 90, 0xffffff).setOrigin(0.5);
    this.dialogBg.setStrokeStyle(2, 0x000000);
    this.dialogText = this.add.text(580, 520, this.tutorialText[0], {
        fontSize: "22px",
        fontStyle: "bold",
        color: "#000000",
        wordWrap: { width: 550 },
        align: "center"
    }).setOrigin(0.5);

    this.helperText = this.add.text(580, 570, "Press SPACE to continue...", {
      fontSize: "16px",
      color: "#666",
      align: "center"
    }).setOrigin(0.5);

    // Advance on SPACE key
    this.input.keyboard.on("keydown-SPACE", () => {
      this.dialogIndex++;
      if (this.dialogIndex < this.tutorialText.length) {
        this.dialogText.setText(this.tutorialText[this.dialogIndex]);

        if (this.dialogIndex === 1) {
          this.helperText.setVisible(false); // Hide helper after first click
        }
      } else {
        this.scene.start("Home"); // Transition to actual Home scene
      }
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(800, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);

    // Reuse your player's animations if already defined in another scene
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }),
        frameRate: 5,
        repeat: -1
      });
    }

    this.player.anims.play("idle");
  }
}

export default TutorialScene;

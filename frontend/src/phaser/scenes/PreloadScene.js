import Phaser from "phaser";
import WebFont from "webfontloader";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  init(data) {
    this.targetScene = data?.targetScene;
    this.assets = data?.assets || [];
  }

  preload() {
    // Load WebFont script if not already loaded
    if (!window.WebFont) {
      this.load.script(
        "webfont",
        "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
      );
    }

    // If we're loading assets for a specific scene
    if (this.targetScene) {
      const scene = this.scene.manager.keys[this.targetScene];
      if (scene && scene.preload) {
        // Call the scene's preload method to load its assets
        scene.preload.call(this);
      }
    } else {
      // Load default assets for normal game flow
      this.loadDefaultAssets();
    }

    // Add loading text
    const { width, height } = this.scale;
    this.loadingText = this.add
      .text(width / 2, height / 2, "Loading...", {
        fontSize: "32px",
        fill: "#fff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Add loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 30, 320, 50);

    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 40, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      this.loadingText.destroy();
    });
  }

  loadDefaultAssets() {
    this.load.once("filecomplete-script-webfont", () => {
      WebFont.load({
        google: {
          families: ["Orbitron:400,700"],
        },
      });
    });

    this.load.image(
      "tileset",
      "/office-simulator-2025/assets/asset-export-final-resized.png",
      {
        filtering: false,
        premultipliedAlpha: false,
      }
    );

    this.load.tilemapTiledJSON(
      "tilemap",
      "/office-simulator-2025/assets/newer-test-office-resized.tmj"
    );

    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );

    this.load.atlas(
      "blue-chair",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.png",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.json"
    );

    this.load.atlas(
      "orange-chair",
      "/office-simulator-2025/assets/attachments/orange_chair_resized.png",
      "/office-simulator-2025/assets/attachments/orange_chair_resized.json"
    );

    this.load.atlas(
      "green-chair",
      "/office-simulator-2025/assets/attachments/green_chair_resized.png",
      "/office-simulator-2025/assets/attachments/green_chair_resized.json"
    );

    this.load.atlas(
      "red-chair",
      "/office-simulator-2025/assets/attachments/red_chair_resized.png",
      "/office-simulator-2025/assets/attachments/red_chair_resized.json"
    );

    this.load.atlas(
      "desktop_pc",
      "/office-simulator-2025/assets/attachments/Desktop_PC.png",
      "/office-simulator-2025/assets/attachments/Desktop_PC.json"
    );

    this.load.atlas(
      "door",
      "/office-simulator-2025/assets/attachments/Door_resized.png",
      "/office-simulator-2025/assets/attachments/Door_resized.json"
    );

    this.load.atlas(
      "printer",
      "/office-simulator-2025/assets/attachments/printer_resized.png",
      "/office-simulator-2025/assets/attachments/printer_resized.json"
    );

    this.load.atlas(
      "vending-machine",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.png",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.json"
    );
  }

  create() {
    if (this.targetScene) {
      // If we were loading assets for a specific scene, go to that scene
      this.scene.start(this.targetScene);
    } else {
      // Otherwise, continue with normal game flow
      this.scene.start("MainMenuScene");
    }
  }
}

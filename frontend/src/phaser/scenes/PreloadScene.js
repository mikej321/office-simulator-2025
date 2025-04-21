import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
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
      "speech-bubble",
      "/office-simulator-2025/assets/speech_bubble.png",
      "/office-simulator-2025/assets/speech_bubble.json"
    );

    this.load.atlas(
      "blue-chair",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.png",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.json"
    );

    this.load.atlas(
      "orange-chair",
      "/office-simulator-2025/assets/attachments/orange_chair.png",
      "/office-simulator-2025/assets/attachments/orange_chair.json"
    );

    this.load.atlas(
      "green-chair",
      "/office-simulator-2025/assets/attachments/green_chair.png",
      "/office-simulator-2025/assets/attachments/green_chair.json"
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
      "/office-simulator-2025/assets/attachments/Door.png",
      "/office-simulator-2025/assets/attachments/Door.json"
    );

    this.load.atlas(
      "printer",
      "/office-simulator-2025/assets/attachments/printer.png",
      "/office-simulator-2025/assets/attachments/printer.json"
    );

    this.load.atlas(
      "vending-machine",
      "/office-simulator-2025/assets/attachments/vending_machine.png",
      "/office-simulator-2025/assets/attachments/vending_machine.json"
    );

    // this.load.start()
  }

  create() {
    this.scene.start("TestScene");
  }
}

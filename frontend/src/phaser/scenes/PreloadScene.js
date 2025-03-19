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

    // this.load.start()
  }

  create() {
    this.scene.start("TestScene");
  }
}

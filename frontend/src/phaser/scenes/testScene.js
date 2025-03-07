import Phaser from "phaser";
import WebFont from "webfontloader";

class TestScene extends Phaser.Scene {
  constructor() {
    super({
      key: "testScene",
    });
  }

  preload() {
    this.load.image(
      "base_tiles",
      "/office-simulator-2025/assets/test-office-1.png"
    );
    this.load.tilemapTiledJSON(
      "tilemap",
      "/office-simulator-2025/assets/test-office-1.json"
    );
  }

  /* I'm currently receiving an error that it cannot read undefined for the Tileset.
  Figure out why this is tomorrow! */
  create() {
    // this.add.image(0, 0, "base_tiles").setOrigin(0, 0);

    // Create the tilemap
    const map = this.make.tilemap({
      key: "tilemap",
    });

    const tileset = map.addTilesetImage("office-supplies-2", "base_tiles");

    map.createLayer("Tile Layer 1", tileset, 0, 0).setScale(1);

    // create the layers we want in the right order
  }

  update() {}
}

export default TestScene;

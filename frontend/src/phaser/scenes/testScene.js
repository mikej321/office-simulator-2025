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

    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );

    this.load.start();
  }

  create() {
    // this.add.image(0, 0, "base_tiles").setOrigin(0, 0);

    // Create the tilemap
    this.map = this.make.tilemap({
      key: "tilemap",
    });

    this.tileset = this.map.addTilesetImage("office-supplies-2", "base_tiles");

    this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);

    this.createPlayer();
  }

  update() {
    this.playerMovement();
  }

  createPlayer() {
    this.player = this.physics.add
      .sprite(0, 500, "player", "frame-1")
      .setScale(2);

    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", {
        start: 1,
        end: 35,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [
        {
          key: "player",
          frame: "frame-9",
        },
      ],
      frameRate: 20,
    });

    this.cameras.main.startFollow(this.player);
    this.physics.world.createDebugGraphic();
  }

  playerMovement() {
    // Creates the cursor for player input
    this.cursor = this.input.keyboard.createCursorKeys();

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else if (this.cursor.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play("walk", true);
      this.player.flipY = true;
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play("walk", true);
      this.player.flipY = false;
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.player.anims.play("turn");
    }
  }
}

export default TestScene;

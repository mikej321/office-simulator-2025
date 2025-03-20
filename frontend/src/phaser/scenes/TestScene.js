import Phaser from "phaser";
import WebFont from "webfontloader";

class TestScene extends Phaser.Scene {
  constructor() {
    super({
      key: "TestScene",
    });
  }

  preload() {}

  create() {
    /* A transition occurs here. A delay is added
    to force the scene to wait until the last scene is finished
    fading out */
    this.cameras.main.setAlpha(0); // starts it out fully invisible
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    const map = this.make.tilemap({
      key: "tilemap",
    });

    this.tileset = map.addTilesetImage("asset-export-final-resized", "tileset");
    this.textures
      .get("asset-export-final-resized")
      .setFilter(Phaser.Textures.FilterMode.NEAREST);
    // This is the code that fixes the issue

    this.floor = map.createLayer("Floor", this.tileset, 0, 0);
    this.floorDeco = map.createLayer("Floor Decorations", this.tileset, 0, 0);
    this.separators = map.createLayer("Cubicle Separators", this.tileset, 0, 0);
    this.deskRight = map.createLayer("Cubicle Desk Right", this.tileset, 0, 0);
    this.deskLeft = map.createLayer("Cubicle Desk Left", this.tileset, 0, 0);
    this.desktops = map.createLayer("Desktops", this.tileset, 0, 0);
    this.deskDeco = map.createLayer("Desktop Decorations", this.tileset, 0, 0);
    this.wall = map.createLayer("Wall", this.tileset, 0, 0);
    this.wallDeco = map.createLayer("Wall Decorations", this.tileset, 0, 0);
    this.tableDeco = map.createLayer("Table Decorations", this.tileset, 0, 0);

    // Setting the e key up for button presses
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    this.layerArr = [
      this.floor,
      this.floorDeco,
      this.separators,
      this.deskRight,
      this.deskLeft,
      this.desktops,
      this.deskDeco,
      this.wall,
      this.wallDeco,
      this.tableDeco,
    ];

    this.physics.world.setBounds(10, 98, map.widthInPixels, map.heightInPixels);

    this.createPlayer();

    // Ensures the player cant move beyond the game world
    this.player.setCollideWorldBounds(true);

    // World Boundaries
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels - 7
    );

    // Camera Boundaries
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // this.cameras.main.setZoom(1.5);

    this.cameras.main.roundPixels = true;

    this.createCollisions(this.player, this.layerArr);
  }

  update() {
    this.playerMovement();

    this.recognizeTileInteractable(this.layerArr);
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({
        collision: true,
      });

      this.physics.add.collider(player, layer);
    });
  }

  recognizeTileInteractable(layers) {
    layers.forEach((layer) => {
      const tileWidth = layer.tileset[0].tileWidth;
      const tileHeight = layer.tileset[0].tileHeight;

      let tileX = Math.floor(this.player.x / tileWidth);
      let tileY = Math.floor(this.player.y / tileHeight);

      const tile = layer.getTileAt(tileX, tileY);

      console.log(
        `Player Position: x = ${this.player.x}, y = ${this.player.y}, tileX: ${tileX}, tileY: ${tileY}`
      );

      if (tile && tile.properties.clicked) {
        console.log("interacted with the tile!");
      }
    });
  }

  createPlayer() {
    // Creates the player sprite
    this.player = this.physics.add
      .sprite(0, 300, "player", "frame-1")
      .setScale(0.8);

    this.player.setSize(32, 32);

    // Sets collision detection for the world boundary

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", {
        start: 10,
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

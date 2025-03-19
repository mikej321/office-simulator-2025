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
    const map = this.make.tilemap({
      key: "tilemap",
    });

    this.tileset = map.addTilesetImage("asset-export-final-resized", "tileset");

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

    this.floor.setCollisionByProperty({
      collision: true,
    });

    this.floorDeco.setCollisionByProperty({
      collision: true,
    });

    this.separators.setCollisionByProperty({
      collision: true,
    });

    this.deskRight.setCollisionByProperty({
      collision: true,
    });

    this.deskLeft.setCollisionByProperty({
      collision: true,
    });

    this.desktops.setCollisionByProperty({
      collision: true,
    });

    this.deskDeco.setCollisionByProperty({
      collision: true,
    });

    this.wall.setCollisionByProperty({
      collision: true,
    });

    this.wallDeco.setCollisionByProperty({
      collision: true,
    });

    this.wallDeco.setVisible(true);

    this.tableDeco.setCollisionByProperty({
      collision: true,
    });

    this.physics.world.setBounds(10, 98, map.widthInPixels, map.heightInPixels);

    this.createPlayer();

    // Ensures the player cant move beyond the game world
    this.player.setCollideWorldBounds(true);

    // Collision Detection
    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(this.player, this.floorDeco);
    this.physics.add.collider(this.player, this.separators);
    this.physics.add.collider(this.player, this.deskRight);
    this.physics.add.collider(this.player, this.deskLeft);
    this.physics.add.collider(this.player, this.desktops);
    this.physics.add.collider(this.player, this.deskDeco);
    this.physics.add.collider(this.player, this.wall);
    this.physics.add.collider(this.player, this.wallDeco);
    this.physics.add.collider(this.player, this.tableDeco);
    this.physics.add.collider(this.player, this.floorDeco);

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
  }

  update() {
    this.playerMovement();
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

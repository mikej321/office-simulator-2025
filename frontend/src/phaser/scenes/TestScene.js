import Phaser from "phaser";
import WebFont from "webfontloader";
import SpeechBubble from "../../factories/speechBubble";

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
    // this.cameras.main.setAlpha(0); // starts it out fully invisible
    // this.time.delayedCall(1100, () => {
    //   this.cameras.main.setAlpha(1);
    //   this.cameras.main.fadeIn(1000);
    // });

    this.map = this.make.tilemap({
      key: "tilemap",
    });

    this.tileset = this.map.addTilesetImage(
      "asset-export-final-resized",
      "tileset"
    );
    this.textures
      .get("asset-export-final-resized")
      .setFilter(Phaser.Textures.FilterMode.NEAREST);
    // This is the code that fixes the issue

    this.floor = this.map.createLayer("Floor", this.tileset, 0, 0);
    this.floorDeco = this.map.createLayer(
      "Floor Decorations",
      this.tileset,
      0,
      0
    );

    this.separators = this.map.createLayer(
      "Cubicle Separators",
      this.tileset,
      0,
      0
    );
    this.deskRight = this.map.createLayer(
      "Cubicle Desk Right",
      this.tileset,
      0,
      0
    );

    this.deskLeft = this.map.createLayer(
      "Cubicle Desk Left",
      this.tileset,
      0,
      0
    );
    this.desktops = this.map.createLayer("Desktops", this.tileset, 0, 0);
    this.deskDeco = this.map.createLayer(
      "Desktop Decorations",
      this.tileset,
      0,
      0
    );
    this.wall = this.map.createLayer("Wall", this.tileset, 0, 0);
    this.wallDeco = this.map.createLayer(
      "Wall Decorations",
      this.tileset,
      0,
      0
    );
    this.tableDeco = this.map.createLayer(
      "Table Decorations",
      this.tileset,
      0,
      0
    );

    this.interactables = this.physics.add.staticGroup();

    // Blue Chair Object

    this.blueChairLayer = this.map.getObjectLayer("Blue Chair");

    this.blueChairLayer.objects.forEach((obj) => {
      const frame = obj.properties.find((p) => p.name === "frame").value;
      const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;

      const chair = this.add
        .sprite(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          "blue-chair",
          frame
        )
        .setOrigin(0.5, 0.5)
        .setFlipX(flipX);

      if (flipX) {
        chair.x += 9;
        chair.y -= 4;
      } else {
        chair.x -= 9;
        chair.y -= 4;
      }

      this.physics.add.existing(chair, true);

      this.interactables.add(chair);
    });

    this.redChairLayer = this.map.getObjectLayer("Red Chair");

    this.redChairLayer.objects.forEach((obj) => {
      const frame = obj.properties.find((p) => p.name === "frame").value;
      const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;

      const chair = this.add
        .sprite(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          "red-chair",
          frame
        )
        .setOrigin(0.5, 0.5)
        .setFlipX(flipX);

      if (flipX) {
        chair.x += 9;
        chair.y -= 3;
      } else {
        chair.x -= 9;
        chair.y -= 3;
      }

      this.physics.add.existing(chair, true);

      this.interactables.add(chair);
    });

    this.greenChairLayer = this.map.getObjectLayer("Green Chair");

    this.greenChairLayer.objects.forEach((obj) => {
      const frame = obj.properties.find((p) => p.name === "frame").value;
      const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;

      const chair = this.add
        .sprite(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          "green-chair",
          frame
        )
        .setOrigin(0.5, 0.5)
        .setFlipX(flipX);

      chair.y += 1;

      if (flipX) {
        chair.x += 9;
      } else {
        chair.x -= 9;
      }

      this.physics.add.existing(chair, true);

      this.interactables.add(chair);
    });

    this.orangeChairLayer = this.map.getObjectLayer("Orange Chair");

    this.orangeChairLayer.objects.forEach((obj) => {
      const frame = obj.properties.find((p) => p.name === "frame").value;
      const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;

      const chair = this.add
        .sprite(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          "orange-chair",
          frame
        )
        .setOrigin(0.5, 0.5)
        .setFlipX(flipX);

      chair.y -= 3;

      if (flipX) {
        chair.x += 9;
      } else {
        chair.x -= 9;
      }

      this.physics.add.existing(chair, true);

      this.interactables.add(chair);
    });

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

    this.physics.world.setBounds(
      10,
      98,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.createPlayer();

    // Ensures the player cant move beyond the game world
    this.player.setCollideWorldBounds(true);

    // World Boundaries
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels - 7
    );

    // Camera Boundaries
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // this.cameras.main.setZoom(1.5);

    this.cameras.main.roundPixels = true;

    this.createCollisions(this.player, this.layerArr);

    this.bubble = new SpeechBubble(
      this,
      this.player.x,
      this.player.y - this.player.height / 2,
      "Hello there, I am Tom",
      {},
      250
    );

    this.bubble.show();

    this.time.delayedCall(3000, () => this.bubble.hide());
  }

  update() {
    this.playerMovement();

    this.bubble.setPosition(
      this.player.x,
      this.player.y - this.player.height / 2
    );
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({
        collision: true,
      });

      this.physics.add.collider(player, layer);
    });
  }

  createPlayer() {
    // Creates the player sprite
    this.player = this.physics.add
      .sprite(260, 230, "player", "frame-1")
      .setScale(0.8);

    this.player.setSize(32, 32);

    // Sets collision detection for the world boundary

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", {
        start: 8,
        end: 12,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "back",
      frames: this.anims.generateFrameNames("player", {
        start: 17,
        end: 19,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", {
        start: 1,
        end: 8,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
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
      this.player.anims.play("back", true);
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play("walk", true);
      this.player.flipY = false;
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.player.anims.play("idle");
    }
  }
}

export default TestScene;

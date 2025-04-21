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

    if (!this.anims.exists("bubble")) {
      this.anims.create({
        key: "bubble",
        frames: this.anims.generateFrameNames("speech-bubble", {
          start: 1,
          end: 3,
          prefix: "frame-",
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    this.introductionsAreInOrder();
  }

  update() {
    this.playerMovement();
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({
        collision: true,
      });

      this.physics.add.collider(player, layer);
    });
  }

  // introductionsAreInOrder() {
  //   this.time.delayedCall(2500, () => {
  //     this.speechAnimation(
  //       this.player.x + 10,
  //       this.player.y - 35,
  //       "Hello there!"
  //     );
  //     this.time.delayedCall(
  //       3000,
  //       () => {
  //         this.speechBubble.destroy();
  //       },
  //       [],
  //       this
  //     );
  //   });
  // }

  introductionsAreInOrder() {
    this.time.delayedCall(2500, this.showFirstText, [], this);
  }

  showFirstText() {
    this.speechAnimation(
      this.player.x + 10,
      this.player.y - 35,
      "Hello there!",
      8
    );

    this.time.delayedCall(
      3000,
      () => {
        this.speechBubble.anims.stop("bubble");
        this.destroyText();
      },
      [],
      this
    );
  }

  destroySpeechBubble() {
    if (this.speechBubble) {
      this.speechBubble.destroy();
    }
  }

  destroyText() {
    if (this.text) {
      this.text.destroy();
    }

    this.time.delayedCall(500, this.showSecondText, [], this);
  }

  finalDestroyText() {
    if (this.text && this.speechBubble) {
      this.text.destroy();
      this.speechBubble.destroy();
    }
  }

  showSecondText() {
    this.speechAnimation(
      this.player.x + 10,
      this.player.y - 35,
      `Welcome to \nour game!`,
      8
    );

    this.time.delayedCall(3000, () => {
      this.finalDestroyText();
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

  speechAnimation(x, y, text, size) {
    this.speechBubble = this.add.sprite(x + 2, y - 10, "textbox").setScale(2);

    this.speechBubble.play("bubble");

    this.text = this.add
      .text(x, y - 55, text, {
        fontSize: `${size}px`,
        color: "#000",
        fontFamily: "Arial",
        align: "center",
        wordWrap: {
          width: 140,
        },
      })
      .setOrigin(0.5);
  }
}

export default TestScene;

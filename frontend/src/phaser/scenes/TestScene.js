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
    this.sensors = this.physics.add.staticGroup();
    this.printerGroup = this.add.group();

    [
      "Blue Chair",
      "Red Chair",
      "Green Chair",
      "Orange Chair",
      "Vending Machine",
      "Door",
      "Printer",
      "Door Sensor",
      "Vending Sensor",
      "Printer Sensor",
    ].forEach((layerName) => {
      this.map.getObjectLayer(layerName).objects.forEach((obj) => {
        const isTileObject = obj.gid !== undefined;
        const objects = this.map.getObjectLayer(layerName).objects;
        const frame = obj.properties.find((p) => p.name === "frame")?.value;
        const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;
        const centerX = obj.x + obj.width / 2;
        const centerY = isTileObject
          ? obj.y - obj.height / 2
          : obj.y + obj.height / 2;

        if (layerName === "Printer") {
          objects.forEach((obj, idx) => {
            const sprite = this.interactables
              .create(
                obj.x + obj.width / 2,
                obj.y - obj.height / 2,
                "printer",
                obj.properties.find((p) => p.name === "frame").value
              )
              .setOrigin(0.5);

            this.objectNudge(sprite, -6, 37);

            sprite.body.setSize(obj.width, obj.height);
            sprite.body.setOffset(
              (sprite.width - obj.width) / 2,
              (sprite.height - obj.height) / 2
            );

            this.printerGroup.add(sprite);

            const zoneObj =
              this.map.getObjectLayer("Printer Sensor").objects[idx];
            const zone = this.add
              .zone(
                zoneObj.x + zoneObj.width / 2,
                zoneObj.y + zoneObj.height / 2,
                zoneObj.width,
                zoneObj.height
              )
              .setOrigin(0.5);
            this.physics.add.existing(zone, true);
            zone.name = "Printer Sensor";
            zone.linkedSprite = sprite;
            this.sensors.add(zone);
          });

          return;
        }
        if (layerName.includes("Sensor")) {
          const zone = this.add
            .zone(centerX, centerY, obj.width, obj.height)
            .setOrigin(0.5);

          zone.sensorType = obj.name;
          this.physics.add.existing(zone, true);
          zone.body.debugShowBody = false;
          zone.name = obj.name;
          this.sensors.add(zone);

          return;
        }

        const sprite = this.interactables
          .create(
            centerX,
            centerY,
            layerName.toLowerCase().replace(" ", "-"),
            frame
          )
          .setOrigin(0.5)
          .setFlipX(flipX);

        /* All of the position nudges are placed by using a custom function 'objectNudge'.
        The objectNudge takes 4 parameters
        
        obj: In this case, it'd be the created sprite above
        propertyName (optional): This is an optional parameter for doing conditionals based on if
        the property exists
        x: How far you want to nudge it on the x axis
        y: How far you want to nudge it on the y axis

        */
        switch (layerName) {
          case "Red Chair":
            this.objectNudge(sprite, 9, 2, flipX);
            break;
          case "Blue Chair":
            this.objectNudge(sprite, 9, 3, flipX);
            break;
          case "Orange Chair":
            this.objectNudge(sprite, 9, 2, flipX);
            break;
          case "Green Chair":
            this.objectNudge(sprite, 9, -2, flipX);
            break;
          case "Door":
            this.objectNudge(sprite, 0, 18);
            break;
          default:
            break;
        }

        //

        // if (layerName === "Door") {
        //   sprite.y += 18;
        // }

        /* This is the code that's responsible for shrinking the sprite's canvas body
        down to the proper size. Without it, it would create invisible walls that prevent
        the player from walking */
        sprite.body.setSize(obj.width, obj.height);
        sprite.body.setOffset(
          (sprite.width - obj.width) / 2,
          (sprite.height - obj.height) / 2
        );

        this.physics.add.existing(sprite, true);

        // this.debugBox(sprite);

        this.interactables.add(sprite);
      });
    });

    this.createPlayer();

    this.physics.add.collider(this.player, this.interactables);

    // Setting the e key up for button presses
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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

    // Object Sprite Definitions for later usage
    this.doorSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "door");

    this.printerSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "printer");
    // Object Animations

    this.anims.create({
      key: "exit",
      frames: this.anims.generateFrameNames("door", {
        prefix: "door-",
        start: 1,
        end: 8,
      }),
      frameRate: 24,
      repeat: 0,
    });

    this.anims.create({
      key: "print",
      frames: this.anims.generateFrameNames("printer", {
        prefix: "printer-",
        start: 1,
        end: 8,
      }),
      frameRate: 8,
      repeat: 0,
    });

    // flags for sensors
    this.currentSensor = null;
    this.bubble = null;

    this.physics.add.overlap(
      this.player,
      this.sensors,
      (player, zone) => {
        // console.log("entered sensor named", zone.name);

        // If in a zone, do nothing
        if (this.bubble) return;
        if (this.currentSensor === zone) return;

        let msg;

        switch (zone.name) {
          case "Door Sensor":
            msg = `Press 'E' to leave work`;
            break;
          case "Vending Sensor":
            msg = `Press 'E' to grab a drink`;
            break;
          case "Printer Sensor":
            msg = `Press 'E' to print something`;
            break;
          default:
            break;
        }

        this.bubble = new SpeechBubble(
          this,
          this.player.x,
          this.player.y - this.player.height / 2 - 10,
          msg,
          {},
          250
        );

        this.bubble.show();
        this.currentSensor = zone;
      },
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.sensors,
      null,
      (player, zone) => {
        if (
          this.currentSensor === zone &&
          !this.physics.world.overlap(this.player, zone)
        ) {
          console.log("exited sensor named", zone.name);
          this.currentSensor = null;
        }
        return false;
      },
      this
    );
  }

  update() {
    this.playerMovement();

    const sensor = this.currentSensor;

    if (
      this.currentSensor &&
      this.currentSensor.name === "Door Sensor" &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      if (this.doorSprite) {
        this.doorSprite.play("exit");
      }

      if (this.bubble) {
        this.bubble.hide();
        this.bubble.destroy();
        this.bubble = null;
      }

      sensor.body.enable = false;
      sensor.setVisible(false);

      this.currentSensor = null;

      this.time.delayedCall(3000, () => {
        this.doorSprite.anims.playReverse("exit");

        sensor.body.enable = true;
        sensor.setVisible(true);
      });

      return;
    } else if (
      this.currentSensor &&
      this.currentSensor.name === "Printer Sensor" &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      if (sensor.linkedSprite) {
        sensor.linkedSprite.play("print");
      }

      if (this.bubble) {
        this.bubble.hide();
        this.bubble.destroy();
        this.bubble = null;
      }

      sensor.body.enable = false;
      sensor.setVisible(false);

      this.currentSensor = null;

      this.time.delayedCall(3000, () => {
        sensor.body.enable = true;
        sensor.setVisible(true);
      });

      return;
    }

    if (sensor && this.bubble) {
      this.bubble.setPosition(
        this.player.x,
        this.player.y - this.player.height / 2 - 10
      );

      if (!this.physics.world.overlap(this.player, sensor)) {
        console.log("Exited sensor named", sensor.name);
        this.bubble.hide();
        this.bubble = null;
        this.currentSensor = null;
      }
    }
  }

  // Custom Debug Box function. Place it anywhere with a sprite inside to generate a red box
  debugBox(sprite) {
    this.add
      .rectangle(
        sprite.body.x + sprite.body.width / 2,
        sprite.body.y + sprite.body.height / 2,
        sprite.body.width,
        sprite.body.height,
        0xff00000,
        0.3
      )
      .setOrigin(0.5);
  }

  distanceCheck(player, object) {
    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      object.x,
      object.y
    );

    if (dist < 32) {
      console.log("I am in range");
    }
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({
        collision: true,
      });

      this.physics.add.collider(player, layer);
    });
  }

  objectNudge(obj, objX, objY, propertyName = "") {
    if (propertyName === "") {
      obj.x += objX;
      obj.y += objY;
    } else if (propertyName) {
      obj.x += objX;
      obj.y -= objY;
    } else {
      obj.x -= objX;
      obj.y -= objY;
    }
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

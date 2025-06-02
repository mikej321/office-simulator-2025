import Phaser from "phaser";
import SpeechBubble from "../../factories/speechBubble";
import PauseMenu from "../../factories/pauseMenu";
import { saveProgress } from "../../utils/saveGame";
import { showPopup } from "../../utils/showPopup";
import { getCharacterSaveData } from "../../utils/gameState";

class TestScene extends Phaser.Scene {
  constructor() {
    super({
      key: "TestScene",
    });
  }

  preload() {
    // Tilemap and tileset
    this.load.tilemapTiledJSON(
      "tilemap",
      "/office-simulator-2025/assets/newer-test-office-resized.tmj"
    );
    this.load.image(
      "tileset",
      "/office-simulator-2025/assets/asset-export-final-resized.png"
    );
    this.load.atlas(
      "printer",
      "/office-simulator-2025/assets/attachments/printer_resized.png",
      "/office-simulator-2025/assets/attachments/printer_resized.json"
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
      "vending-machine",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.png",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.json"
    );
    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );
  }

  create() {
    const playerName = localStorage.getItem("playerName");
    const playerStats = localStorage.getItem("playerStats");
    if (playerName === "Cheat3r") {
      console.log(
        `TestScene accessed through Cheat3r - following stats were loaded (basic):`,
        playerStats
      );
    }

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

    this.map.getObjectLayer("Objects").objects.forEach((obj) => {
      const { x, y, name: layerName, flipX } = obj;
      const sprite = this.add.sprite(
        x,
        y,
        layerName.toLowerCase().replace(/ /g, "-")
      );
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
      sprite.body.setSize(obj.width, obj.height);
      sprite.body.setOffset(
        (sprite.width - obj.width) / 2,
        (sprite.height - obj.height) / 2
      );
      this.physics.add.existing(sprite, true);
      this.interactables.add(sprite);
    });

    this.createPlayer();

    this.physics.add.collider(this.player, this.interactables);

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

    this.player.setCollideWorldBounds(true);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels - 7
    );

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

    this.cameras.main.roundPixels = true;

    this.createCollisions(this.player, this.layerArr);

    this.doorSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "door");

    this.printerSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "printer");

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

    this.currentSensor = null;
    this.bubble = null;

    this.physics.add.overlap(
      this.player,
      this.sensors,
      (player, zone) => {
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

    this.clockText = this.add
      .text(235, 32, "", {
        fontFamily: "Orbitron",
        fontSize: "12px",
        color: "#00ff00",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.gameTime = new Date();
    this.gameTime.setHours(9, 0, 0, 0);

    const timeScale = 120;

    this.updateClock();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime.setSeconds(this.gameTime.getSeconds() + timeScale);
        this.updateClock();
      },
      callbackScope: this,
      loop: true,
    });

    this.pauseMenu = new PauseMenu(this, {
      onSave: async () => {
        const token = localStorage.getItem("token");
        console.log("Token used for saveProgress:", token);
        const currentStats = getCharacterSaveData(this);
        try {
          const result = await saveProgress(currentStats, token);
          showPopup(
            this,
            result.saved ? "Progress Saved!" : "No Progress to Save"
          );
        } catch {
          showPopup(this, "Save failed!");
        }
      },
      onBack: () => {
        this.scene.start("PlayerMenuScene");
      },
    });

    this.input.keyboard.on("keydown-P", () => {
      if (!this.pauseMenu.isPaused) {
        this.pauseMenu.show();
      }
    });
    this.isPaused = false;
  }

  update() {
    if (this.pauseMenu.isPaused) return;

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

  updateClock() {
    const h = String(this.gameTime.getHours()).padStart(2, "0");
    const m = String(this.gameTime.getMinutes()).padStart(2, "0");
    this.clockText.setText(`${h}:${m}`);
  }

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

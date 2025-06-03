// COMPLETE UPDATED EndOfDay SCENE WITH INTERACTABLE INTEGRATION
import Phaser from "phaser";
import WebFont from "webfontloader";
import EODStats from "./EODStats";
import StatsManager from "../utils/StatsManager";

class EndOfDay extends Phaser.Scene {
  constructor() {
    super({ key: "EndOfDay" });
  }

  preload() {}

  objectNudge(sprite, offsetX, offsetY) {
    sprite.y += offsetY;
    sprite.x += offsetX;
  }

  create() {
    this.cameras.main.setAlpha(0);
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    const gameWidth = 800;
    const gameHeight = 600;
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    this.map = this.make.tilemap({ key: "tilemap" });
    this.tileset = this.map.addTilesetImage("asset-export-final-resized", "tileset");
    this.textures.get("asset-export-final-resized").setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.floor = this.map.createLayer("Floor", this.tileset, offsetX, offsetY);
    this.floorDeco = this.map.createLayer("Floor Decorations", this.tileset, offsetX, offsetY);
    this.separators = this.map.createLayer("Cubicle Separators", this.tileset, offsetX, offsetY);
    this.deskRight = this.map.createLayer("Cubicle Desk Right", this.tileset, offsetX, offsetY);
    this.deskLeft = this.map.createLayer("Cubicle Desk Left", this.tileset, offsetX, offsetY);
    this.desktops = this.map.createLayer("Desktops", this.tileset, offsetX, offsetY);
    this.deskDeco = this.map.createLayer("Desktop Decorations", this.tileset, offsetX, offsetY);
    this.wall = this.map.createLayer("Wall", this.tileset, offsetX, offsetY);
    this.wallDeco = this.map.createLayer("Wall Decorations", this.tileset, offsetX, offsetY);
    this.tableDeco = this.map.createLayer("Table Decorations", this.tileset, offsetX, offsetY);

    this.layerArr = [
      this.floor, this.floorDeco, this.separators,
      this.deskRight, this.deskLeft, this.desktops,
      this.deskDeco, this.wall, this.wallDeco, this.tableDeco
    ];

    this.interactables = this.physics.add.staticGroup();
    this.sensors = this.physics.add.staticGroup();

    this.anims.create({
      key: "exit",
      frames: this.anims.generateFrameNames("door", { prefix: "door-", start: 1, end: 8 }),
      frameRate: 24,
      repeat: 0,
    });

    this.anims.create({
      key: "print",
      frames: this.anims.generateFrameNames("printer", { prefix: "printer-", start: 1, end: 8 }),
      frameRate: 8,
      repeat: 0,
    });

    [
      "Blue Chair", "Red Chair", "Green Chair", "Orange Chair",
      "Vending Machine", "Door", "Printer",
      "Door Sensor", "Vending Sensor", "Printer Sensor"
    ].forEach((layerName) => {
      const objects = this.map.getObjectLayer(layerName)?.objects || [];
      objects.forEach((obj, idx) => {
        const frame = obj.properties?.find((p) => p.name === "frame")?.value;
        const flipX = !!obj.properties?.find((p) => p.name === "flipX")?.value;
        const centerX = offsetX + obj.x + obj.width / 2;
        const centerY = offsetY + obj.y + obj.height / 2;

        if (layerName.includes("Sensor")) {
          const zone = this.add.zone(centerX, centerY, obj.width, obj.height).setOrigin(0.5);
          zone.name = obj.name;
          this.physics.add.existing(zone, true);
          this.sensors.add(zone);
          return;
        }

        const textureKey = layerName.toLowerCase().replace(/ /g, "-");
        const sprite = this.interactables.create(centerX, centerY, textureKey, frame ?? (textureKey === "door" ? "door-1" : undefined))
          .setOrigin(0.5)
          .setFlipX(flipX);

        switch (layerName) {
          case "Door": this.objectNudge(sprite, 0, 28); break;
          default: break;
        }

        sprite.body?.setSize(obj.width, obj.height);
        sprite.body?.setOffset((sprite.width - obj.width) / 2, (sprite.height - obj.height) / 2);
        this.physics.add.existing(sprite, true);
      });
    });

    this.doorSprite = this.interactables.getChildren().find(c => c.texture.key === "door");
    this.printerSprite = this.interactables.getChildren().find(c => c.texture.key === "printer");

    this.physics.world.setBounds(offsetX, offsetY, this.map.widthInPixels, this.map.heightInPixels);
    this.createPlayer();
    this.player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.roundPixels = true;
    this.cameras.main.startFollow(this.player);

    this.createCollisions(this.player, this.layerArr, offsetX, offsetY);

    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactableX = offsetX + 255;
    this.interactableY = offsetY + 75;
    this.interactableRadius = 75;

    this.interactionText = this.add.text(
      this.interactableX,
      this.interactableY - 50,
      "Press E to go home for the day",
      {
        fontFamily: "Fredoka",
        fontSize: "18px",
        color: "#1c0d00",
        backgroundColor: "#ffffff",
        padding: { x: 14, y: 8 },
        align: "center",
        wordWrap: { width: 300 },
        shadow: {
          offsetX: 1, offsetY: 1,
          color: "#999999", blur: 0, stroke: false, fill: true
        },
      }
    ).setOrigin(0.5).setVisible(false);

    this.interactableCircle = this.add.circle(
      this.interactableX,
      this.interactableY,
      this.interactableRadius,
      0xffff00,
      0.3
    );

    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update() {
    this.playerMovement();

    const isPlayerInArea = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.interactableX, this.interactableY
    ) <= this.interactableRadius;

    if (this.interactionText) {
      this.interactionText.setVisible(isPlayerInArea);
      if (isPlayerInArea) {
        this.interactionText.setPosition(this.interactableX, this.interactableY - 50);
      }
    }

    if (isPlayerInArea && Phaser.Input.Keyboard.JustDown(this.eKey)) {
        if (this.doorSprite) {
        this.doorSprite.anims.play("exit", true);
      }
      this.time.delayedCall(2500, () => {
        this.scene.stop("WorkDay");
        this.scene.start("HomeEvening");
      });
    }
  }

  createCollisions(player, layers, offsetX, offsetY) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({ collision: true });
      this.physics.add.collider(player, layer);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(800, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);

    this.anims.create({ key: "walk", frames: this.anims.generateFrameNames("player", { start: 8, end: 12, prefix: "frame-" }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "back", frames: this.anims.generateFrameNames("player", { start: 17, end: 19, prefix: "frame-" }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "idle", frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }), frameRate: 5, repeat: -1 });
  }

  playerMovement() {
    this.cursor = this.input.keyboard.createCursorKeys();
    const velocity = 100;

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursor.up.isDown) {
      this.player.setVelocityY(-velocity);
      this.player.anims.play("back", true);
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(velocity);
      this.player.anims.play("walk", true);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.anims.play("idle", true);
    }
  }
}

export default EndOfDay;

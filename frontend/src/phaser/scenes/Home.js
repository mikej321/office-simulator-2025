import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";

class Home extends Phaser.Scene {
  constructor() {
    super({ key: "Home" });
    this.taskCount = 0;
    this.maxTasks = 3;
    this.interactionInProgress = false;
  }

  preload() {
    this.load.image("tiles", "assets/InteriorTilesLITE.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
  }

  create() {
    this.interactionInProgress = false;

    this.cameras.main.setAlpha(0);
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    const gameWidth = 800;
    const gameHeight = 600;
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("HouseTileSet", "tiles");

    this.collisionLayers = [];
    map.layers.forEach((layerData) => {
      const layer = map.createLayer(layerData.name, tileset, offsetX, offsetY);
      // Set collision shapes from Tiled
  layer.setCollisionFromCollisionGroup();
      this.collisionLayers.push(layer);
    });

    this.createPlayer();
    this.player.setCollideWorldBounds(true);

    this.collisionLayers.forEach(layer => {
      this.physics.add.collider(this.player, layer);
    });

    this.interactHint = this.add
      .text(0, 0, "E", {
        fontSize: "20px",
        fill: "#fff",
        backgroundColor: "#000",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(999)
      .setAlpha(1);

    this.interactables = this.physics.add.staticGroup();
    this.currentInteraction = null;

    const objectLayer = map.getObjectLayer("interactables");

    objectLayer.objects.forEach((obj) => {
      const zone = this.interactables
        .create(obj.x + offsetX + obj.width / 2, obj.y + offsetY + obj.height / 2, null)
        .setSize(obj.width, obj.height)
        .setOrigin(0.5)
        .setVisible(false);

      zone.name = obj.name || "unnamed";
      zone.properties = obj.properties || [];
    });

    this.physics.add.overlap(this.player, this.interactables, this.handleOverlap, null, this);
  }

  update() {
    if (!this.interactionInProgress) {
      this.playerMovement();

      if (this.currentInteraction && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.triggerInteraction(this.currentInteraction);
        this.currentInteraction = null;
      }
    }

    if (this.currentInteraction && !this.interactionInProgress) {
      this.interactHint.setVisible(true);
      this.interactHint.setPosition(this.player.x, this.player.y - 40);
    } else {
      this.interactHint.setVisible(false);
    }

    const overlapping = this.physics.overlap(this.player, this.interactables);
    if (!overlapping) {
      this.currentInteraction = null;
    }
  }

  handleOverlap(player, zone) {
    if (!this.interactionInProgress) {
      this.currentInteraction = zone;
    }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(800, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);

    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNames("player", { start: 8, end: 12, prefix: "frame-" }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!this.anims.exists("back")) {
      this.anims.create({
        key: "back",
        frames: this.anims.generateFrameNames("player", { start: 17, end: 19, prefix: "frame-" }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }),
        frameRate: 5,
        repeat: -1,
      });
    }

    this.cameras.main.startFollow(this.player);
  }

  playerMovement() {
    const velocity = 170;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-velocity);
      this.player.anims.play("back", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(velocity);
      this.player.anims.play("walk", true);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.anims.play("idle", true);
    }
  }

  triggerInteraction(zone) {
    if (this.interactionInProgress) return;

    const name = zone.name?.toLowerCase() || "unknown";
    const actionText = this.getActionText(name);

    this.confirmInteraction(name, actionText);
  }

  confirmInteraction(name, actionText) {
    this.interactionInProgress = true;

    const style = {
      fontSize: "16px",
      fill: "#fff",
      backgroundColor: "#222",
      padding: { x: 12, y: 6 },
      wordWrap: { width: 300 },
    };

    const box = this.add
      .text(this.player.x, this.player.y - 50, `Are you sure you want to ${actionText}? (Y/N)`, style)
      .setOrigin(0.5);

    const yesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    const noKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    const confirmHandler = () => {
      if (Phaser.Input.Keyboard.JustDown(yesKey)) {
        box.destroy();
        this.events.off("update", confirmHandler);
        this.input.keyboard.removeKey(yesKey);
        this.input.keyboard.removeKey(noKey);
        this.performTask(name);
      } else if (Phaser.Input.Keyboard.JustDown(noKey)) {
        box.destroy();
        this.events.off("update", confirmHandler);
        this.input.keyboard.removeKey(yesKey);
        this.input.keyboard.removeKey(noKey);
        this.interactionInProgress = false;
      }
    };

    this.events.on("update", confirmHandler);
  }

  performTask(name) {
    this.taskCount++;

    this.showMessage(`You did: ${this.getActionText(name)}`);

    if (this.taskCount >= this.maxTasks || name === "bed") {
      this.time.delayedCall(1500, () => {
        this.scene.stop("Home");
        this.taskCount = 0;
        this.scene.start("WorkDay");
      });
    } else {
      this.time.delayedCall(1500, () => {
        this.scene.restart();
      });
    }
  }

  getActionText(name) {
    switch (name) {
      case "tv":
        return "watch TV";
      case "desk":
        return "sit at the desk";
      case "bringlunch":
        return "pack your lunch";
      case "bed":
        return "go to sleep";
      case "read":
        return "read a book";
      case "calloff":
        return "call off work";
      case "freshenup":
        return "freshen up";
      default:
        return "do this";
    }
  }

  showMessage(text) {
    const style = {
      fontSize: "16px",
      fill: "#fff",
      backgroundColor: "#000",
      padding: { x: 10, y: 5 },
    };

    const msg = this.add.text(this.player.x, this.player.y - 40, text, style).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      msg.destroy();
    });
  }
}

export default Home;
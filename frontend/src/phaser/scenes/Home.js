import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import MusicManager from "./MusicManager";
import StatsOverlay from '../utils/StatsOverlay';


class Home extends Phaser.Scene {
  constructor() {
    super({ key: "Home" });
    this.taskCount = 0;
    this.maxTasks = 3;
    this.interactionInProgress = false;
  }

  init() {
    this.textStyle = {
      fontFamily: "Fredoka",
      fontSize: "18px",
      color: "#1c0d00",              // warm black text
      backgroundColor: "#ffffff",    // white background
      padding: { x: 14, y: 8 },       // generous spacing
      align: "center",
      wordWrap: { width: 300 },
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#ff7a00",             // dark orange shadow glow (emulates a border glow)
        blur: 0,
        stroke: false,
        fill: true,
      },
    };
  }

  preload() {
    this.load.image("tiles", "assets/InteriorTilesLITE.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
  }

  create() {
    this.statsOverlay = new StatsOverlay(this);
    this.scene.get('MusicManager').stopMusic();
    if (!this.scene.isActive('MusicManager')) {
      this.scene.launch('MusicManager');
      this.time.delayedCall(100, () => {
        this.scene.get('MusicManager').playTrack('home');
      });
    } else {
      this.scene.get('MusicManager').playTrack('home');
    }

    this.interactionInProgress = false;

    this.cameras.main.setAlpha(0);
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
      this.displayGoodMorning();
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
      .text(0, 0, "E", this.textStyle)
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
    //console.log("Scene update running");//debugging
    //console.log("statsOverlay ref:", this.statsOverlay);//debugging
    this.statsOverlay.update();
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

    //this.cameras.main.startFollow(this.player);
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

    const box = this.add
      .text(this.player.x, this.player.y - 50, `${actionText}? (Y/N)`, this.textStyle)
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
    if (name === "calloff") {
      this.showMessage("You called off work today.");
      this.time.delayedCall(3000, () => {
        this.scene.stop("Home");
        this.taskCount = 0;
        this.scene.start("HomeEvening"); //transition to the evening scene
      });
      return;
    }
    this.taskCount++;

    this.showMessage(this.getActionFlavorText(name), 7000); // now using new param for 7s

    switch (name) {
      case "tv":
        StatsManager.incrementMP();
        StatsManager.incrementFocusLevel();
        break;
      case "desk":
        StatsManager.incrementMotivationLevel();
        StatsManager.incrementMP();
        StatsManager.decrementEnergyLevel();
        break;
      case "bringlunch":
        StatsManager.incrementEnergyLevel();
        break;
      case "bed":
        StatsManager.incrementMP();
        StatsManager.incrementEnergyLevel();
        StatsManager.decrementFocusLevel();
        StatsManager.decrementMotivationLevel();
        break;
      case "read":
        StatsManager.incrementFocusLevel();
        StatsManager.incrementMP();
        StatsManager.incrementMotivationLevel();
        break;
      case "calloff":
        StatsManager.incrementMP();
        StatsManager.incrementMP();
        StatsManager.incrementEnergyLevel();
        StatsManager.incrementFocusLevel();
        StatsManager.decrementMotivationLevel();
        StatsManager.decrementMotivationLevel();
        StatsManager.decrementFocusLevel();
        StatsManager.decrementEnergyLevel();
        break;
      case "freshenup":
        StatsManager.incrementMotivationLevel();
        StatsManager.incrementFocusLevel();
        break;
      default:
        break;
  }

    if (this.taskCount >= this.maxTasks || name === "bed") {
      this.time.delayedCall(5000, () => {
      this.scene.stop("Home");
      this.taskCount = 0;
      this.scene.start("WorkDay");
    });
    } else {
      this.time.delayedCall(5000, () => {
        this.scene.restart();
      });
    }
  }

  getActionText(name) {
    switch (name) {
      case "tv":
        return "watch the news";
      case "desk":
        return "watch a podcast";
      case "bringlunch":
        return "make breakfast";
      case "bed":
        return "sleep in extra";
      case "read":
        return "read your book";
      case "calloff":
        return "call off work";
      case "freshenup":
        return "put extra effort into appearance";
      default:
        return "do this";
    }
  }

  getActionFlavorText(name){
    switch (name) {
      case "tv":
        return "You learn exactly nothing useful, but you feel informed.";
      case "desk":
        return "'You are the CEO of your vibe,' says a man with six side hustles.";
      case "bringlunch":
        return "You burn toast so perfectly it's modern art.";
      case "bed":
        return "Five more minutes turns into a full-on lifestyle.";
      case "read":
        return "You read one paragraph. Then re-read it. Three times.";
      case "calloff":
        return "You fake cough so well, you almost believe it.";
      case "freshenup":
        return "You clean up so well, your mirror says 'who's that?'";
      default:
        return "do this";
    }
  }

  showMessage(text, duration = 7000) {
    // Destroy existing message if still showing
    if (this.activeMessage) {
      this.activeMessage.destroy();
    }

    this.activeMessage = this.add
      .text(this.player.x, this.player.y - 40, text, this.textStyle)
      .setOrigin(0.5)
      .setDepth(999);

    this.time.delayedCall(duration, () => {
      if (this.activeMessage) {
        this.activeMessage.destroy();
        this.activeMessage = null;
      }
    });
  }

displayGoodMorning() {
  const morningStyle = {
    ...this.textStyle,
    fontSize: "30px",
  };
  const msg = this.add
    .text(this.scale.width / 2, 80, "Good morning!", morningStyle)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(999)
    .setAlpha(0)
    .setScale(0.8);

  // Animate it to pop in gently
  this.tweens.add({
    targets: msg,
    alpha: 1,
    scale: 1,
    duration: 700,
    ease: 'Back.Out',
    yoyo: true,
    hold: 2000,
    onComplete: () => msg.destroy(),
  });

  // Optional: soft jingle sound
  // this.sound.play('morningChime');
}

}
export default Home;
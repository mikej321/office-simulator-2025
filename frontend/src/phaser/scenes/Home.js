import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";

class Home extends Phaser.Scene {
  constructor() {
    super({ key: "Home" });
  }

  preload() {
    this.load.image('tiles', 'assets/InteriorTilesLITE.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');
  }

  create() {
    // Reset the workday count if starting fresh
    if (StatsManager.getWorkDayCount() === 0) {
      StatsManager.resetWorkDayCount();
    }

    // Fade-in transition
    this.cameras.main.setAlpha(0);
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Define game area
    const gameWidth = 800;
    const gameHeight = 600;
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    // Load tilemap
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('HouseTileSet', 'tiles');

    // Render each static layer
    map.layers.forEach(layerData => {
      map.createLayer(layerData.name, tileset, offsetX, offsetY);
    });

    // Create player
    this.createPlayer();
    this.player.setCollideWorldBounds(true);

    // Create interaction zones
    this.interactables = this.physics.add.staticGroup();
    this.currentInteraction = null;

    const objectLayer = map.getObjectLayer('interactables');

    objectLayer.objects.forEach(obj => {
      const zone = this.interactables.create(
        obj.x + offsetX + obj.width / 2,
        obj.y + offsetY + obj.height / 2,
        null
      )
      .setSize(obj.width, obj.height)
      .setOrigin(0.5)
      .setVisible(true); // set to false once things are aligned

      zone.name = obj.name || 'unnamed';
      zone.properties = obj.properties || [];
    });

    // Draw debug rectangles for interactable zones
    this.interactables.getChildren().forEach(zone => {
      const debug = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x00ff00, 0.3);
      debug.setOrigin(0.5);
    });

    // Overlap detection
    this.physics.add.overlap(this.player, this.interactables, (player, zone) => {
      this.currentInteraction = zone;
    }, null, this);
  }

  update() {
    this.playerMovement();

    if (this.currentInteraction && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.triggerInteraction(this.currentInteraction);
      this.currentInteraction = null;
    }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(800, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", { start: 8, end: 12, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "back",
      frames: this.anims.generateFrameNames("player", { start: 17, end: 19, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });

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
    console.log(`Interacted with: ${zone.name}`);

    const messageProp = zone.properties.find(p => p.name === 'message');
    if (messageProp) {
      this.showMessage(messageProp.value);
    }
  }

  showMessage(text) {
    const style = {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    };

    const msg = this.add.text(this.player.x, this.player.y - 40, text, style)
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      msg.destroy();
    });
  }
}

export default Home;
import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import MusicManager from "./MusicManager";
import StatsOverlay from '../utils/StatsOverlay';


class WorkDay extends Phaser.Scene { 
  constructor() {
    super({
      key: "WorkDay",
    });
  }

  currentChrisLineIndex = null;

  init(){
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
        color: "#999999",             // dark gray glow
        blur: 0,
        stroke: false,
        fill: true,
      },
    };
  }

  preload() {
    this.load.atlas("blue-chair", "assets/attachments/blue_chair_resized.png", "assets/attachments/blue_chair_resized.json");
    this.load.atlas("orange-chair", "assets/attachments/orange_chair_resized.png", "assets/attachments/orange_chair_resized.json");
    this.load.atlas("green-chair", "assets/attachments/green_chair_resized.png", "assets/attachments/green_chair_resized.json");
    this.load.atlas("red-chair", "assets/attachments/red_chair_resized.png", "assets/attachments/red_chair_resized.json");
    this.load.atlas("desktop_pc", "assets/attachments/Desktop_PC.png", "assets/attachments/Desktop_PC.json");
    this.load.atlas("door", "assets/attachments/Door_resized.png", "assets/attachments/Door_resized.json");
    this.load.atlas("printer", "assets/attachments/printer_resized.png", "assets/attachments/printer_resized.json");
    this.load.atlas("vending-machine", "assets/attachments/vending_machine_resized.png", "assets/attachments/vending_machine_resized.json");

    this.load.image("avatarTall", "assets/avatar-tall.png");
  }

  create() {

this.interactionText = this.add
  .text(0, 0, "", this.textStyle)
  .setOrigin(0.5)
  .setVisible(false);
this.interactionText.setDepth(999);



    this.chrisLines = [
        "Debugging is like being the detective in a crime movie where you're also the murderer.",
        "Did you try turning it off and on again?",
        "Your code compiles? Looks like someone’s graduating!",
        "Keep calm and `git commit`.",
        "Behind every great coder is a stack of failed builds.",
        "You're not just pushing code — you're pushing limits.",
        "Real programmers don't comment code. If it was hard to write, it should be hard to read.",
        "Don't worry, I left a few bugs in there for nostalgia.",
        "Every bug you squashed brought you here.",
        "You don't write bugs — you write unexpected features.",
        "Remember: failing tests are just misunderstood success stories.",
        "`NaN`, `undefined`, `null` — just like my emotions during your first project review.",
        "Code is poetry. And your early work was... abstract.",
        "Graduating? Who gave you permission to stop learning?",
        "Your recursion has finally terminated. Congratulations!",
        "I ran a `diff` between then and now — you’ve improved *a lot*.",
        "You’ve passed the ultimate test: building AND surviving a JavaScript game.",
        "This game isn’t just fun — it’s functionally awesome.",
        "What’s the runtime complexity of awesomeness? O(you).",
        "Don’t forget me when you’re CTO.",
        "Error 404: Apprenticeship not found. You did it!",
        "You're like a well-named variable — meaningful and reliable.",
        "Did you optimize your dreams for performance too?",
        "If coding were a game, you just hit the boss level.",
        "No more imposter syndrome. Just programmer pride.",
        "You’re not just a dev. You’re a dev who shipped.",
        "You used to `console.log()` bugs. Now you log victories.",
        "Let’s `merge` this branch of your life with greatness.",
        "This apprenticeship was your sandbox. Now it’s production time.",
        "The code of success: curiosity + grit + caffeine.",
        "Your apprenticeship is over, but your commits live on.",
        "You’ve graduated from for-loops to foresight.",
        "I’m not crying. My fan is just overheating.",
        "Just promise me one thing: always write tests.",
        "Stack Overflow better watch out. You’re coming.",
        "You came. You coded. You conquered.",
        "Let’s be real — I’m just an NPC in the game of your life.",
        "Achievement unlocked: Survived mentorship with Chris.",
        "Your future codebases thank you for today.",
        "I taught you everything I know. The rest is up to you.",
        "Now go out there and cause some meaningful merge conflicts.",
    ];
    this.wasNearChris = false; // Tracks whether player was previously near Chris


    this.statsOverlay = new StatsOverlay(this);
    this.scene.get('MusicManager').stopMusic();
    if (!this.scene.isActive('MusicManager')) {
      this.scene.launch('MusicManager');
    }
    this.scene.get('MusicManager').playTrack('office');


    // Reset the workday count if starting fresh
    if (StatsManager.getWorkDayTaskNumber() === 0) {
      StatsManager.resetWorkDayTaskNumber();
    }

    // Fade-in transition
    this.cameras.main.setAlpha(0); // starts it out fully invisible
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    // Define the game area dimensions
    const gameWidth = 800;
    const gameHeight = 600;

    // Calculate the top-left corner of the game area
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    // Create the tilemap and position it in the center
    this.map = this.make.tilemap({ key: "tilemap" });
    this.tileset = this.map.addTilesetImage("asset-export-final-resized", "tileset");
    this.textures.get("asset-export-final-resized").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Create layers and position them relative to the offsets
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

    // Add UI elements and position them relative to the offsets
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.createPlayer();

    this.interactHint = this.add.text(0, 0, 'E', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setVisible(false);
    

    // Ensures the player can't move beyond the game world
    this.player.setCollideWorldBounds(true);

    this.createCollisions(this.player, [
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
    ]);

    this.interactables = this.physics.add.staticGroup();
this.sensors = this.physics.add.staticGroup();

[
  "Blue Chair", "Red Chair", "Green Chair", "Orange Chair",
  "Vending Machine", "Door", "Printer",
  "Door Sensor", "Vending Sensor", "Printer Sensor"
].forEach((layerName) => {
  const objects = this.map.getObjectLayer(layerName)?.objects || [];
  objects.forEach((obj) => {
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

      sprite.setDepth(5);

    if (layerName === "Door") {
      sprite.y += 28;
    }

    sprite.body?.setSize(obj.width, obj.height);
    sprite.body?.setOffset((sprite.width - obj.width) / 2, (sprite.height - obj.height) / 2);
    this.physics.add.existing(sprite, true);
  });
});

this.doorSprite = this.interactables.getChildren().find(c => c.texture.key === "door");
this.printerSprite = this.interactables.getChildren().find(c => c.texture.key === "printer");
this.vendingSprite = this.interactables.getChildren().find(c => c.texture.key === "vending-machine");

this.anims.create({
  key: "door_anim",
  frames: this.anims.generateFrameNames("door", {
    prefix: "door-", start: 1, end: 8
  }),
  frameRate: 10,
  repeat: 0,
});

this.anims.create({
  key: "printer_anim",
  frames: this.anims.generateFrameNames("printer", {
    prefix: "printer-", start: 1, end: 8
  }),
  frameRate: 10,
  repeat: 0,
});

this.anims.create({
  key: "vending_anim",
  frames: this.anims.generateFrameNames("vending-machine", {
    prefix: "vending-machine-", start: 1, end: 7
  }),
  frameRate: 10,
  repeat: 0,
});




    // Create interaction text
    this.interactionText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight - 50, "Press E to work for the day", this.textStyle).setOrigin(0.5);
    this.interactionText.setVisible(false);

    this.choiceText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight / 2, "Q: Work for the day\nR: Goof off", this.textStyle).setOrigin(0.5);
    this.choiceText.setVisible(false);

    // Define the interactable area
    this.interactableX = offsetX + 425;
    this.interactableY = offsetY + 200;
    this.interactableRadius = 40;

    this.interactableCircle = this.add.circle(
      this.interactableX,
      this.interactableY,
      this.interactableRadius,
      0xffff00,
      0.3
    );

    // Add the avatar image at a chosen position
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //HERE
    //was 300, 400
    this.avatar = this.physics.add.image(600, 450, "avatarTall").setScale(0.1).setDepth(1); 
    this.avatar.body.setAllowGravity(false); // Make sure Chris doesn’t fall
    this.avatar.body.immovable = true;       // Chris should not move on collision



    // Add a text box for interaction (hidden by default)
    this.avatarText = this.add.text(this.avatar.x, this.avatar.y - 50, "", this.textStyle).setOrigin(0.5).setVisible(false);


    // Enable overlap check between player and avatar
    this.physics.add.overlap(this.player, this.avatar, () => {
      const nearAvatar = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.avatar.x, this.avatar.y
      ) < 50;

    if (nearAvatar && !this.wasNearChris) {
        this.wasNearChris = true;

        const randomIndex = Phaser.Math.Between(0, this.chrisLines.length - 1);
        const randomLine = this.chrisLines[randomIndex];

        if (randomLine && randomLine.trim() !== "") {
          console.log("Chris says:", randomLine);
          this.avatarText.setText(randomLine);
          this.avatarText.setVisible(true);
          this.children.bringToTop(this.avatarText); // Ensure text is above other objects
        } else {
          console.warn("Empty or undefined Chris line!");
          this.avatarText.setText("..."); // fallback
          this.avatarText.setVisible(true);
        }

      } else if (!nearAvatar && this.wasNearChris) {
        this.wasNearChris = false;
        this.avatarText.setVisible(false);
      }
    }, null, this);
  }

  update() {

    this.physics.overlap(this.player, this.sensors, (player, sensor) => {
  if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
    const name = sensor.name?.toLowerCase();

    if (name.includes("door") && this.doorSprite) {
      this.doorSprite.anims.play("door_anim", true);
      this.time.delayedCall(2000, () => {
        this.scene.start("HomeEvening"); // or next scene
      });
    } else if (name.includes("printer") && this.printerSprite) {
      this.printerSprite.anims.play("printer_anim", true);
    } else if (name.includes("vending") && this.vendingSprite) {
      this.vendingSprite.anims.play("vending_anim", true);
    }
  }
});

    this.statsOverlay.update();
    // Check if the workday loop is complete
    if (StatsManager.getWorkDayTaskNumber() >= 3) {
       StatsManager.incrementWorkDayCount();

      // Check if limit is reached
      if (StatsManager.getWorkDayCount() >= StatsManager.getWorkDayLimit()) {
        StatsManager.setWorkDayLimitReached(true);
      }
      StatsManager.resetWorkDayTaskNumber();
      console.log("Workday loop complete. Transitioning to EndOfDay.");
      this.scene.stop("WorkDay");
      this.scene.start("EndOfDay");
      return;
    }

    this.playerMovement();
     const px = this.player.x;
  const py = this.player.y;

  // Printer interaction
  const printerDist = Phaser.Math.Distance.Between(px, py, this.printerSprite.x, this.printerSprite.y);
  const nearPrinter = printerDist < 70;

  // Door interaction
  const doorDist = Phaser.Math.Distance.Between(px, py, this.doorSprite.x, this.doorSprite.y);
  const nearDoor = doorDist < 70;

  this.interactionText.setVisible(false); // Hide by default

  if (nearPrinter) {

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.printerSprite.play("print-anims", true);
      // Do other print effects here
    }
  }

  if (nearDoor) {

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.doorSprite.play("door-anim", true);
      this.time.delayedCall(2000, () => {
        this.scene.start("HomeEvening");
      });
    }
  }



    // Check if the player is within the interactable area
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.interactableX,
      this.interactableY
    );
    const isPlayerInArea = distance <= this.interactableRadius;

    // Show or hide the "Press E to work for the day" text
    if (isPlayerInArea && !this.choiceText.visible) {
      this.interactionText.setPosition(this.interactableX, this.interactableY - 50);
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }

    // Handle interaction when the E key is pressed
    if (isPlayerInArea && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      console.log("Interacted with the specific area!");
      this.choiceText.setPosition(this.interactableX, this.interactableY - 50);
      this.choiceText.setVisible(true);

      // Hide the "Press E to work for the day" text
      this.interactionText.setVisible(false);
    }

    // Handle the player's choice
    if (this.choiceText.visible) {
      if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
        let effectiveness = 1;
        if (StatsManager.getEnergyLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getFocusLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getMotivationLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getMP() <= 0) effectiveness -= 1;

        effectiveness = Math.max(0, effectiveness); // Cap at minimum 0

        const projectGain = Math.floor(effectiveness);
        for (let i = 0; i < projectGain; i++) {
          StatsManager.incrementPP();
        }
        // Burnout penalty for working
        StatsManager.decrementEnergyLevel();
        StatsManager.decrementMotivationLevel();
        StatsManager.decrementFocusLevel();
        StatsManager.decrementMP();
        console.log("Player chose to work for the day!");
        this.choiceText.setVisible(false);
        this.interactionText.setVisible(false);
        // Destroy the existing player before respawning
      if (this.player) {
        this.player.destroy(); // Remove the existing player sprite
      }

        // Respawn the player
        //this.player.setPosition(500, 300);

        // Increment the workday count
        StatsManager.incrementWorkDayTaskNumber();
        this.createPlayer(); // Recreate the player to show the correct text
        this.createCollisions(this.player, [
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
        ]);
      } else if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
          console.log("Player chose to goof off!");
          StatsManager.incrementMP();
          StatsManager.incrementMotivationLevel();
          StatsManager.incrementEnergyLevel();
          StatsManager.decrementFocusLevel();
          this.choiceText.setVisible(false);

        // Increment the workday count
        StatsManager.incrementWorkDayTaskNumber();

        // Transition to Pong
        this.scene.stop("WorkDay");
        this.scene.start("Pong");
      }
    }

    if (this.currentInteraction && !this.interactionInProgress) {
      this.interactHint.setVisible(true);
      this.interactHint.setPosition(this.player.x, this.player.y - 40);
    } else {
      this.interactHint.setVisible(false);
    }

    const nearAvatar = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.avatar.x, this.avatar.y
    ) < 50;

    if (nearAvatar && !this.wasNearChris) {
      this.wasNearChris = true;

      // Pick a new random line index that's not the same as last time
      let newIndex;
      do {
        newIndex = Phaser.Math.Between(0, this.chrisLines.length - 1);
      } while (newIndex === this.currentChrisLineIndex && this.chrisLines.length > 1);

      this.currentChrisLineIndex = newIndex;
      const newLine = this.chrisLines[this.currentChrisLineIndex];

      this.avatarText.setText(newLine);
      this.avatarText.setVisible(true);
    } else if (!nearAvatar && this.wasNearChris) {
      this.wasNearChris = false;
      this.avatarText.setVisible(false);
    }
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({ collision: true });
      this.physics.add.collider(player, layer);
    });
  }

  createPlayer() {
    //HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE//HERE
    //HERE
    //HERE
    //HERE
    // was 500,300
    this.player = this.physics.add.sprite(850, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);
    this.player.setDepth(10); // or any number higher than the objects


    if (!this.anims.exists("walk")){
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", { start: 8, end: 12, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    if (!this.anims.exists("back")){
    this.anims.create({
      key: "back",
      frames: this.anims.generateFrameNames("player", { start: 17, end: 19, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    if (!this.anims.exists("idle")){
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    //this.cameras.main.startFollow(this.player);

  const currentDay = StatsManager.getWorkDayCount(); // 1–5
  const workDay = currentDay - 1; // Adjust to 0–4
  console.log("Current workday in createPlayer:", workDay);

  const taskNum = StatsManager.getWorkDayTaskNumber(); // 0–2
  console.log("Current task count in createPlayer:", taskNum);

  // Defensive check: make sure workDay and taskNum are valid
  if (workDay >= 0 && workDay < 5 && taskNum >= 0 && taskNum < 3) {
    const bossYells = {
      0: [
        "Tom, you better get working! Your desk is collecting dust.",
        "Don’t forget the onboarding checklist this time.",
        "And stop drinking so much coffee!",
      ],
      1: [
        "We have deadlines, Tom. Dead. Lines.",
        "Did you even clock in today?",
        "You're not paid to stare at your computer screen!",
      ],
      2: [
        "That report better be done before lunch.",
        "Why is your desk always a mess?",
        "You're not the office cat whisperer, Tom!",
      ],
      3: [
        "The printer is not your friend. Stop hugging it.",
        "We are a *team*, Tom. Not a one-man circus.",
        "Did you do your best today Tom?",
      ],
      4: [
        "It’s Friday. Try *not* to mess this one up.",
        "HR is watching, Tom. Smile more.",
        "Your performance review is soon. Be afraid.",
      ],
    };

    const line = bossYells[workDay][taskNum];
    const spawnText = this.add.text(
      this.scale.width - 300,  // X: near right edge with some padding
      40,                     // Y: top with some padding
      line,
      this.textStyle
    ).setOrigin(0.5);

    this.time.delayedCall(6000, () => {
      spawnText.destroy();
    });
  } else {
    console.warn("No boss yell found for day", workDay, "and task", taskNum);
  }

  }

  playerMovement() {
    this.cursor = this.input.keyboard.createCursorKeys();
    const velocity = 100;

    let isMoving = false;

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.flipX = true;
      isMoving = true;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.flipX = false;
      isMoving = true;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursor.up.isDown) {
      this.player.setVelocityY(-velocity);
      isMoving = true;
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(velocity);
      isMoving = true;
    } else {
      this.player.setVelocityY(0);
    }

    if (isMoving) {
      if (this.cursor.up.isDown) {
        if (this.player.anims.currentAnim?.key !== "back") {
          this.player.anims.play("back", true);
        }
      } else {
        if (this.player.anims.currentAnim?.key !== "walk") {
          this.player.anims.play("walk", true);
        }
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.anims.play("idle", true);
      }
    }
  }
}
export default WorkDay;
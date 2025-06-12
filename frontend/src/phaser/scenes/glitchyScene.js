import Phaser from "phaser";
import WebFont from "webfontloader";
import SpeechBubble from "../../factories/speechBubble";
import TypewriterText from "../../factories/typewriterText";
import WorkDay from "./WorkDay";
import Player from "../../factories/player";
import Archer from "../../factories/archer";
import Slime from "../../factories/slime";
import Barrel_Knight from "../../factories/barrel_knight";

class GlitchyScene extends Phaser.Scene {
    constructor() {
        super({
            key: "GlitchyScene",
        });

        this.spawnSlime = () => {
            const x = Phaser.Math.Between(900, 1300);
            const y = 400;

            const newSlime = new Slime(this, Phaser.Math.Between(1000, 1500), Phaser.Math.Between(500, 700));
            this.slimes.add(newSlime);
            if (!newSlime) return;

            if (!newSlime.body) {
                this.physics.world.enable(newSlime);
                this.add.existing(newSlime);
            }

            // Common reset for both reused and new
            newSlime.setPosition(x, y);
            newSlime.setActive(true);
            newSlime.setVisible(true);
            newSlime.health = 20;
            newSlime.setAlpha(1);
            newSlime.body.enable = true;
            newSlime.body.pushable = false;

            // Reset archer-specific state
            newSlime.isAttacking = false;
            newSlime.currentState = 'idle'; // Or whatever your default is
            newSlime.anims.play("slime_idle", true); // If applicable
            newSlime.clearTimers?.(); // If you have any custom timers in Archer
        }

        this.spawnArcher = () => {
            const x = Phaser.Math.Between(900, 1300);
            const y = 400;

            const newArcher = new Archer(this, 1000, 500);
            this.archers.add(newArcher);

            if (!newArcher) return;

            if (!newArcher.body) {
                // First time creation
                this.physics.world.enable(newArcher);
                this.add.existing(newArcher);
            }

            newArcher.body.pushable = false;
            // Common reset for both reused and new
            newArcher.setPosition(x, y);
            newArcher.setActive(true);
            newArcher.setVisible(true);
            newArcher.health = 30;
            newArcher.setAlpha(1);
            newArcher.body.enable = true;

            // Reset archer-specific state
            newArcher.isAttacking = false;
            newArcher.currentState = 'idle'; // Or whatever your default is
            newArcher.anims.play("archer_idle", true); // If applicable
            newArcher.clearTimers?.(); // If you have any custom timers in Archer
        }

        this.spawnKnight = () => {
            const x = Phaser.Math.Between(900, 1300);
            const y = 400;

            const newKnight = new Barrel_Knight(this, Phaser.Math.Between(1000, 1500), Phaser.Math.Between(500, 700));
            this.knights.add(newKnight);
            if (!newKnight) return;

            if (!newKnight.body) {
                this.physics.world.enable(newKnight);
                this.add.existing(newKnight);
            }

            // Common reset for both reused and new
            newKnight.setPosition(x, y);
            newKnight.setActive(true);
            newKnight.setVisible(true);
            newKnight.health = 50;
            newKnight.setAlpha(1);
            newKnight.body.enable = true;
            newKnight.body.pushable = false;

            // Reset archer-specific state
            newKnight.isAttacking = false;
            newKnight.currentState = 'idle'; // Or whatever your default is
            newKnight.anims.play("barrel_idle", true); // If applicable
            newKnight.clearTimers?.(); // If you have any custom timers in Archer
        }
    }

    preload() {
        this.fontsLoaded = false;

        WebFont.load({
            google: {
                families: ["Chewy", "Fredoka:wght@300,400,500,600,700"],
            },
            active: () => {
                this.fontsLoaded = true;
            },
            inactive: () => {
                this.fontsLoaded = true;
            },
        });
    }

    create() {
        this.map = this.make.tilemap({
            key: "glitchy_tilemap",
        })

        this.tileset = this.map.addTilesetImage(
            "glitchy-office-tiles",
            "glitchy_tileset"
        );

        this.textures
            .get("glitchy-office-tiles")
            .setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.physics.world.setBounds(
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


        this.floor = this.map.createLayer("floor", this.tileset, 0, 0);
        this.background = this.map.createLayer("background", this.tileset, 0, 0);

        const boundaryUpper = this.map.getObjectLayer("floor_boundary_upper").objects;
        const boundaryLower = this.map.getObjectLayer("floor_boundary_lower").objects;

        const boundaryGroup = this.physics.add.staticGroup();

        this.rem = 16;
        const margin = 250;
        const bubbleWidth = 300;

        const x = this.scale.width - bubbleWidth - margin;

        this.score = 0;


        this.textIsShowing = true;



        // const welcomeText = new TypewriterText(this, x, 250, "Welcome to your worst nightmare, Tom", {
        //     fontSize: '24px',
        //     color: 'blue',
        //     wordWrap: { width: 300 }
        // }, 100, () => {
        //     this.textIsShowing = false;
        // })

        const introText = [
            "Welcome to your nightmare, Tom!",
            "This is your punishment for slacking off...",
            "Clear 5 levels and perhaps you're really suited for the job."
        ];

        let i = 0;
        const showNext = async () => {
            return new Promise((resolve) => {
                const showNext = () => {
                    if (this.typewriter) this.typewriter.destroy();

                    if (i >= introText.length) {
                        this.textIsShowing = false;
                        resolve();
                        return;
                    }

                    this.typewriter = new TypewriterText(this, x, 250, introText[i], {
                        fontSize: "24px",
                        fontFamily: "Fredoka",
                        lineSpacing: 10,
                        color: "blue",
                        wordWrap: {
                            width: 300,
                        }
                    }, 40, () => {
                        this.time.delayedCall(1000, showNext)
                    });

                    i++;
                }

                showNext();
            })
        }

        showNext().then(() => {
            this.time.delayedCall(1000, () => {
                // this.spawnMultipleArchers(10, 100000)
                // this.spawnKnight();
                this.spawnMultipleEnemies(40, 200000);
            })
        })


        // Hitbox groups
        this.playerHitBoxes = this.physics.add.group({
            classType: Phaser.GameObjects.Zone,
            runChildUpdate: true
        });

        this.knightHitBoxes = this.physics.add.group({
            classType: Phaser.GameObjects.Zone,
            runChildUpdate: true
        })

        this.anims.create({
            key: "projectile",
            frames: this.anims.generateFrameNames("archer_projectile", {
                start: 1,
                end: 3,
                prefix: "projectile_"
            }),
            frameRate: 5
        })

        console.log(this.anims.exists("projectile"))

        this.anims.create({
            key: "archer_idle",
            frames: this.anims.generateFrameNames("archer_idle", {
                start: 1,
                end: 6,
                prefix: "idle_"
            }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "archer_run",
            frames: this.anims.generateFrameNames("archer_run", {
                start: 1,
                end: 6,
                prefix: "run_"
            }),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "archer_hurt",
            frames: this.anims.generateFrameNames("archer_death", {
                start: 1,
                end: 3,
                prefix: "hurt_"
            }),
            frameRate: 7,
        })

        this.anims.create({
            key: "archer_death",
            frames: this.anims.generateFrameNames("archer_death", {
                start: 1,
                end: 4,
                prefix: "death_"
            }),
            frameRate: 7,
        })

        this.anims.create({
            key: "archer_attack",
            frames: this.anims.generateFrameNames("archer_attack", {
                start: 1,
                end: 7,
                prefix: "attack_"
            }),
            frameRate: 7,
        })

        this.anims.create({
            key: "barrel_idle",
            frames: this.anims.generateFrameNames("barrel_idle", {
                start: 1,
                end: 4,
                prefix: "barrel_idle_"
            }),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "barrel_attack",
            frames: this.anims.generateFrameNames("barrel_attack", {
                start: 1,
                end: 9,
                prefix: "barrel_attack_"
            }),
            frameRate: 7,
        })

        this.anims.create({
            key: "barrel_death",
            frames: this.anims.generateFrameNames("barrel_death", {
                start: 1,
                end: 6,
                prefix: "barrel_death_"
            }),
            frameRate: 7
        })

        this.anims.create({
            key: "barrel_hurt",
            frames: this.anims.generateFrameNames("barrel_hurt", {
                start: 1,
                end: 5,
                prefix: "barrel_hurt_"
            }),
            frameRate: 7
        })

        this.anims.create({
            key: "barrel_run",
            frames: this.anims.generateFrameNames("barrel_run", {
                start: 1,
                end: 7,
                prefix: "barrel_run_"
            }),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "slime_attack",
            frames: this.anims.generateFrameNames("slime_attack", {
                start: 1,
                end: 8,
                prefix: "slime_attack_"
            }),
            frameRate: 7
        })

        this.anims.create({
            key: "slime_hurt",
            frames: this.anims.generateFrameNames("slime_death", {
                start: 1,
                end: 3,
                prefix: "slime_death_"
            }),
            frameRate: 7
        })

        this.anims.create({
            key: "slime_death",
            frames: this.anims.generateFrameNames("slime_death", {
                start: 1,
                end: 9,
                prefix: "slime_death_"
            }),
            frameRate: 7
        })

        this.anims.create({
            key: "slime_hop",
            frames: this.anims.generateFrameNames("slime_hop", {
                start: 1,
                end: 13,
                prefix: "slime_hop_"
            }),
            frameRate: 7,
            repeat: -1,
        })

        this.anims.create({
            key: "slime_idle",
            frames: this.anims.generateFrameNames("slime_idle", {
                start: 1,
                end: 6,
                prefix: "slime_idle_"
            }),
            frameRate: 7,
            repeat: -1
        })

        boundaryUpper.forEach(obj => {
            const rect = this.add.rectangle(obj.x, obj.y - (obj.height + 40), obj.width, obj.height)
                .setOrigin(0, 1)
                .setVisible(false);

            this.physics.add.existing(rect, true);

            rect.body.setSize(obj.width, obj.height);

            boundaryGroup.add(rect)
        })

        boundaryLower.forEach(obj => {
            const rect = this.add.rectangle(obj.x, obj.y + (obj.height + 3), obj.width, obj.height)
                .setOrigin(0, 1)
                .setVisible(false);

            this.physics.add.existing(rect, true);

            rect.body.setSize(obj.width, obj.height);

            boundaryGroup.add(rect);
        })

        this.archerProjectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: true
        });

        this.player = new Player(this, 0, 500, "glitch_knight_idle", "idle_animation_1").setScale(3);
        this.player.setSize(32, 32);
        // this.player.body.pushable = false;


        // Health Bar Stats
        this.healthBarBG = this.add.rectangle(60, 40, 104, 24, 0x000000)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.healthBar = this.add.rectangle(62, 42 + 2, 100, 20, 0xff0000)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Score Text
        this.marginRight = 4 * this.rem;

        this.scoreText = this.add.text(this.scale.width - this.marginRight, 42, "Score: 0", {
            fontSize: "48px",
            fontFamily: "Fredoka",
            fill: "#fff"
        })

        this.scoreText.setScrollFactor(0);
        this.scoreText.setOrigin(1, 0);

        // this.archer = new Archer(this, 1000, 500);
        this.archers = this.physics.add.group({
            classType: Archer,
            runChildUpdate: true,
            allowGravity: true,
            immovable: false
        })

        this.knights = this.physics.add.group({
            classType: Barrel_Knight,
            runChildUpdate: true,
            allowGravity: true,
            immovable: false
        })

        this.slimes = this.physics.add.group({
            classType: Slime,
            runChildUpdate: true,
            allowGravity: true,
            immovable: false
        })




        if (this.archer) {
            this.archer.setActive(true).setVisible(true);
            this.archer.health = 30;
        }

        if (this.barrel_knight) {
            this.barrel_knight.setActive(true).setVisible(true);
            this.barrel_knight.health = 50;
        }

        if (this.slime) {
            this.slime.setActive(true).setVisible(true);
            this.slime.health = 20;
        }

        // archer properties


        // this.physics.add.collider(this.player, boundaryGroup);
        // this.physics.add.collider(this.player, this.archer);

        this.physics.add.overlap(this.player, this.archerProjectiles, (playerSprite, projectileSprite) => {
            if (typeof playerSprite.handleProjectileHit === "function") playerSprite.handleProjectileHit(projectileSprite);
        }, null, this);

        this.cameras.main.startFollow(this.player);
        
    }

    update(time, delta) {

        if (this.textIsShowing) return;

        if (!this.player.isDead) this.player.playerMovement();

        this.player.playerMovement();
        this.archers.children.iterate((archer) => {
            if (archer && archer.active && archer.body) {
                archer.update(this.player, time, delta);
            }
        })

        this.knights.children.iterate((barrel_knight) => {
            if (barrel_knight && barrel_knight.active && barrel_knight.body) barrel_knight.update(this.player, time, delta);
        })

        this.slimes.children.iterate((slime) => {
            if (slime && slime.active && slime.body) slime.update(this.player, time, delta);
        })
        // if (this.archer && this.archer.active && this.archer.body) {
        //     this.archer.update(this.player, time, delta);
        // }

        const healthPercent = Phaser.Math.Clamp(this.player.currentHealth / this.player.maxHealth, 0, 1);
        const targetWidth = 100 * healthPercent;
        this.healthBar.width += (targetWidth - this.healthBar.width) * 0.1;

        this.scoreText.setX(this.scale.width - this.marginRight);
    }

    debugBox(sprite) {
        this.add.rectangle(
            sprite.body.x + sprite.body.width / 2,
            sprite.body.y + sprite.body.height / 2,
            sprite.body.width,
            sprite.body.height,
            0xff00000,
            0.3
        )
            .setOrigin(0.5);
    }

    spawnDamageText(x, y, amount, color = '#ff3333') {
        const text = this.add.text(x, y, `-${amount}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: color,
            stroke: '#000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0)

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            duration: 800,
            ease: "Power1",
            onComplete: () => text.destroy()
        })
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }








    spawnMultipleArchers(count = 5, duration = 10000) {
        const interval = duration / count;

        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * interval, () => {
                this.spawnArcher();
            });
        }
    }

    spawnMultipleEnemies(count = 5, duration = 10000) {
        const interval = duration / count;

        // place enemies in an array
        const enemies = [
            'archer',
            'barrel_knight',
            'slime'
        ];

        // call a random element from that array to spawn

        // do a check for which enemy was pulled. Whichever was pulled is what will be summoned
        for (let i = 0; i < count; i++) {
            const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
            this.time.delayedCall(i * interval, () => {
                if (randomEnemy === 'archer') {
                    this.spawnArcher();
                } else if (randomEnemy === 'slime') {
                    this.spawnSlime();
                } else if (randomEnemy === 'barrel_knight') {
                    this.spawnKnight();
                }
            })
        }
    }

}

export default GlitchyScene;
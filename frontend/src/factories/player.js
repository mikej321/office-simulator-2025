import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        scene.physics.add.existing(this);

        this.setCollideWorldBounds(this);

        this.speed = 10;

        // Flag that locks movement when an action is playing
        this.isAttacking = false;

        this.isHurt = false; // Flip when hurt
        this.isDead = false; // Flip when health reaches 0

        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.isDefending = false;

        this.isInvincible = false;
        this.invincibilityDuration = 1000;

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNames("glitch_knight_idle", {
                start: 1,
                end: 7,
                prefix: "idle_animation_"
            }),
            frameRate: 10,
            repeat: -1,
        })

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNames("glitch_knight_walk", {
                start: 1,
                end: 8,
                prefix: "walk_animation_"
            }),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNames("glitch_knight_death", {
                start: 1,
                end: 12,
                prefix: "death_animation_"
            }),
            frameRate: 5,
        })

        this.anims.create({
            key: "hurt",
            frames: this.anims.generateFrameNames("glitch_knight_hurt", {
                start: 1,
                end: 4,
                prefix: "hurt_animation_"
            }),
            frameRate: 5,
        })

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNames("glitch_knight_run", {
                start: 1,
                end: 8,
                prefix: "run_animation_"
            }),
            frameRate: 5,
            repeat: -1
        })

        this.anims.create({
            key: "defend",
            frames: this.anims.generateFrameNames("glitch_knight_defend", {
                start: 1,
                end: 6,
                prefix: "defend_animation_"
            }),
            frameRate: 10,
        })

        this.anims.create({
            key: "light",
            frames: this.anims.generateFrameNames("glitch_knight_light", {
                start: 1,
                end: 5,
                prefix: "light_animation_"
            }),
            frameRate: 10
        })

        this.anims.create({
            key: "medium",
            frames: this.anims.generateFrameNames("glitch_knight_medium", {
                start: 1,
                end: 6,
                prefix: "medium_animation_"
            }),
            frameRate: 8
        })

        this.anims.create({
            key: "heavy",
            frames: this.anims.generateFrameNames("glitch_knight_heavy", {
                start: 1,
                end: 6,
                prefix: "heavy_animation_"
            }),
            frameRate: 5
        })

        this.play("idle");


        this.cursor = this.scene.input.keyboard.createCursorKeys();
    
        this.keys = this.scene.input.keyboard.addKeys({
            defend: "E",
            light_attack: "A",
            medium_attack: "S",
            heavy_attack: "D",
            run: "SHIFT",
        })

        this.scene.input.keyboard.on("keydown-E", () => {
            if (!this.isAttacking && !this.isHurt && !this.isDead) {
                this.isAttacking = true;
                this.setVelocity(0);
                this.play("defend", true);
                this.defend();
                this.once("animationcomplete-defend", () => {
                    this.isAttacking = false;
                })
            }
        })
    
        this.scene.input.keyboard.on("keydown-A", () => {
            if (!this.isAttacking && !this.isHurt && !this.isDead) {
                this.isAttacking = true;
                this.setVelocity(0);
                this.play("light", true);
                this.once("animationcomplete-light", () => {
                    this.isAttacking = false;
                })
            }
        })
    
        this.scene.input.keyboard.on("keydown-S", () => {
            if (!this.isAttacking && !this.isHurt && !this.isDead) {
                this.isAttacking = true;
                this.setVelocity(0);
                this.play("medium", true);
                this.once("animationcomplete-medium", () => {
                    this.isAttacking = false;
                })
            }
        })
    
        this.scene.input.keyboard.on("keydown-D", () => {
            if (!this.isAttacking && !this.isHurt && !this.isDead) {
                this.isAttacking = true;
                this.setVelocity(0);
                this.play("heavy", true);
                this.once("animationcomplete-heavy", () => {
                    this.isAttacking = false;
                })
            }
        })
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvincible) return;

        if (this.isDefending && this.anims.currentFrame?.index == 2) {
            amount = 0;
            console.log("perfect defense")
        } else if (this.isDefending && this.anims.currentFrame?.index != 6) {
            amount = amount * 0.5;
            console.log("regular defense")
        }

        this.currentHealth = Phaser.Math.Clamp(this.currentHealth - amount, 0, this.maxHealth);


        console.log('health is ', this.currentHealth)
        
        if (this.isDefending && this.anims.currentFrame?.index !== 6) {
            this.isHurt = false;
            this.isInvincible = true;

            this.scene.time.delayedCall(this.invincibilityDuration, () => {
                this.isInvincible = false;
            })

            this.setTint(0xcccccc);
            this.scene.time.delayedCall(200, () => this.clearTint());
        } else {
            this.isDefending = false;
            this.isAttacking = false;
            this.isHurt = true;
            this.setVelocity(0);
            this.play("hurt", true);

            this.isInvincible = true;
            this.scene.time.delayedCall(this.invincibilityDuration, () => {
                this.isInvincible = false;
            })

            this.once("animationcomplete-hurt", () => {
                this.isHurt = false;
                if (this.currentHealth <= 0) this.die();
            })
        }
        
    }

    defend() {
        if (this.isDead) return;

        this.isAttacking = true;
        this.setVelocity(0);
        this.isDefending = true;

        this.play("defend", true);

        this.once("animationcomplete-defend", () => {
            this.isAttacking = false;
            this.isDefending = false;
        })
    }

    die() {
        if (this.isDead) return;

        this.isDead = true;

        this.setVelocity(0);
        this.isAttacking = false;
        this.isHurt = false;

        this.play("death", true);

        this.once("animationcomplete-death", () => {
            this.body.enable = false;
            this.scene.scene.start("Home"); 
        })
    }
    
    playerMovement() {

        if (this.isAttacking || this.isDead || this.isHurt) return;
        
         if (this.cursor.left.isDown && this.cursor.up.isDown && this.keys.run.isDown) {
            this.setVelocity(-500);
            this.anims.play("run", true);
            this.flipX = true;
        } else if (this.cursor.right.isDown && this.cursor.up.isDown && this.keys.run.isDown) {
            this.setVelocity(500, -500);
            this.anims.play("run", true);
            this.flipX = false;
        }  else if (this.cursor.left.isDown && this.cursor.down.isDown && this.keys.run.isDown) {
            this.setVelocity(-500, 500);
            this.anims.play("run", true);
            this.flipX = true;
        }  else if (this.cursor.right.isDown && this.cursor.down.isDown && this.keys.run.isDown) {
            this.setVelocity(500);
            this.anims.play("run", true);
            this.flipX = false;
        } else if (this.cursor.left.isDown && this.cursor.up.isDown) {
            this.setVelocity(-300)
            this.anims.play("walk", true);
            this.flipX = true;
        } else if (this.cursor.right.isDown && this.cursor.up.isDown) {
            this.setVelocity(300, -300);
            this.anims.play("walk", true);
            this.flipX = false;
        } else if (this.cursor.left.isDown && this.cursor.down.isDown) {
            this.setVelocity(-300, 300);
            this.anims.play("walk", true);
            this.flipX = true;
        }  else if (this.cursor.right.isDown && this.cursor.down.isDown) {
            this.setVelocity(300);
            this.anims.play("walk", true);
            this.flipX = false;
        }
        else if (this.cursor.left.isDown && this.keys.run.isDown) {
            this.setVelocity(-500, 0);
            this.anims.play("run", true);
            this.flipX = true;
        } else if (this.cursor.right.isDown && this.keys.run.isDown) {
            this.setVelocity(500, 0);
            this.anims.play("run", true);
            this.flipX = false;
        } else if (this.cursor.up.isDown) {
            this.setVelocity(0, -300);
            this.anims.play("walk", true);
        } else if (this.cursor.down.isDown) {
            this.setVelocity(0, 300);
            this.anims.play("walk", true);
            this.flipY = false;
        } else if (this.cursor.right.isDown) {
            this.setVelocity(300, 0);
            this.anims.play("walk", true);
            this.flipX = false;
        } else if (this.cursor.left.isDown) {
            this.setVelocity(-300, 0);
            this.anims.play("walk", true);
            this.flipX = true;
        }
        
        else {
            this.setVelocity(0);

            if (this.anims.currentAnim?.key !== "idle") this.anims.play("idle");
        }

    }
}
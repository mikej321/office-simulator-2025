import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        scene.physics.add.existing(this);

        this.setCollideWorldBounds(this);

        console.log("Body type is:", this.body?.constructor.name)
        this.speed = 10;

        // Flag that locks movement when an action is playing
        this.isAttacking = false;

        this.isHurt = false; // Flip when hurt
        this.isDead = false; // Flip when health reaches 0

        this.health = 100;
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

        this.scene.input.keyboard.on("keydown-A", () => this.performAttack("light"));
        this.scene.input.keyboard.on("keydown-S", () => this.performAttack("medium"));
        this.scene.input.keyboard.on("keydown-D", () => this.performAttack("heavy"))
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvincible) return;

        if (this.isDefending && this.anims.currentFrame?.index == 2) {
            amount = 0;
        } else if (this.isDefending && this.anims.currentFrame?.index != 6) {
            amount = amount * 0.5;
        }

        this.currentHealth = Phaser.Math.Clamp(this.currentHealth - amount, 0, this.maxHealth);

        if (amount > 0) {
            this.scene.spawnDamageText(this.x, this.y - this.height, Math.round(amount));
        }

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
            this.scene.time.delayedCall(1000, () => {
                this.scene.scene.transition({
                    target: "WorkDay",
                    duration: 1000
                })
            })
        })
    }

    playerMovement() {

        if (this.isAttacking || this.isDead || this.isHurt) return;

        if (this.cursor.left.isDown && this.cursor.up.isDown && this.keys.run.isDown) {
            this.setVelocity(-500, -500);
            this.anims.play("run", true);
            this.flipX = true;
        } else if (this.cursor.right.isDown && this.cursor.up.isDown && this.keys.run.isDown) {
            this.setVelocity(500, -500);
            this.anims.play("run", true);
            this.flipX = false;
        } else if (this.cursor.left.isDown && this.cursor.down.isDown && this.keys.run.isDown) {
            this.setVelocity(-500, 500);
            this.anims.play("run", true);
            this.flipX = true;
        } else if (this.cursor.right.isDown && this.cursor.down.isDown && this.keys.run.isDown) {
            this.setVelocity(500, 500);
            this.anims.play("run", true);
            this.flipX = false;
        } else if (this.cursor.left.isDown && this.cursor.up.isDown) {
            this.setVelocity(-300, -300)
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
        } else if (this.cursor.right.isDown && this.cursor.down.isDown) {
            this.setVelocity(300, 300);
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

    performAttack(type) {
        if (this.isAttacking || this.isHurt || this.isDead) return;

        this.isAttacking = true;
        this.setVelocity(0);

        let animationKey, damage, knockback;

        switch (type) {
            case 'light':
                animationKey = 'light';
                damage = 5;
                knockback = 150;
                break;
            case 'medium':
                animationKey = 'medium';
                damage = 10;
                knockback = 300;
                break;
            case 'heavy':
                animationKey = 'heavy';
                damage = 15;
                knockback = 600;
                break;
            default:
                return;
        }

        this.play(animationKey, true);

        const attackFrameListener = (anim, frame) => {
            if (frame.index === 3 && !this.attackHitbox) {
                this.spawnAttackHitbox(damage, knockback);
                this.off("animationupdate", attackFrameListener); // remove after one use
            }
        };
        this.on("animationupdate", attackFrameListener);

        this.once(`animationcomplete-${animationKey}`, () => {
            this.isAttacking = false;
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
        })
    }

    spawnAttackHitbox(damage, knockback) {
        const offsetX = this.flipX ? -30 : 30;

        // Create hitbox zone
        const hitbox = this.scene.add.zone(this.x + offsetX, this.y, 40, 30);
        hitbox.setOrigin(0.5);

        this.scene.physics.add.existing(hitbox);
        hitbox.damage = damage;
        hitbox.knockback = knockback;

        this.scene.playerHitBoxes.add(hitbox);
        this.attackHitbox = hitbox;

        // Track enemies already hit
        const alreadyHit = new Set();

        // Allow overlap with group of enemies
        this.scene.physics.add.overlap(hitbox, this.scene.archers, (hitbox, enemy) => {
            if (alreadyHit.has(enemy)) return;
            alreadyHit.add(enemy);

            if (typeof enemy.takeDamage === "function") {
                enemy.takeDamage(hitbox.damage, hitbox);

                // Knockback
                const angle = Phaser.Math.Angle.Between(hitbox.x, hitbox.y, enemy.x, enemy.y);
                const vx = Math.cos(angle) * hitbox.knockback;
                const vy = Math.sin(angle) * hitbox.knockback;

                enemy.setVelocity(vx, vy);
                this.scene.time.delayedCall(200, () => {
                    enemy.setVelocity(0, 0);
                });

                this.scene.spawnDamageText(enemy.x, enemy.y - enemy.height, hitbox.damage);
            }
        });

        // Auto-destroy hitbox after short time
        this.scene.time.delayedCall(150, () => {
            if (hitbox && hitbox.destroy) {
                hitbox.destroy();
                if (this.attackHitbox === hitbox) {
                    this.attackHitbox = null;
                }
            }
        });
    }



    handleProjectileHit(projectile) {
        if (!projectile || this.isDead || this.isInvincible) return;

        const wasDefending = this.isDefending && this.anims.currentFrame?.index === 2;

        if (projectile.damage) this.takeDamage(projectile.damage);

        const dx = this.x - projectile.x;
        const dy = this.y - projectile.y;

        const pushStrength = wasDefending ? 10 : 50;
        const pushVec = new Phaser.Math.Vector2(dx, dy).normalize().scale(pushStrength);

        this.setVelocity(pushVec.x, pushVec.y);

        if (projectile.destroy) {
            projectile.destroy();
        }
    }


}
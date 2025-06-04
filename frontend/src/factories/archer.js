import Phaser from "phaser";

export default class Archer extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "archer_idle", "idle_1");

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.speed = 200; // walk speed

        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(false);
    
            this.setCollideWorldBounds(true);
            this.body.setMaxVelocity(this.speed, this.speed);
        }

        console.log("Body type is:", this.body?.constructor.name)
        this.isDead = false;
        this.health = 20;
        this.isInvincible = false;
        this.invincibilityDuration = 300;
        this.chaseRange = 1000; // chase speed when player gets close to archer
        this.attackRange = 200; // range in which the archer starts his attack
        this.attackCooldown = 2000; // milliseconds between archers attacks
        this.lastAttackTime = 0; // track archers last attack
        this.isKnockedBack = false;


        this.setScale(3);
        this.setOrigin(0.5, 0.5);
        // archer flags
        this.isAttacking = false;
        this.isChasing = false;


        

        this.play("archer_idle", true);
    }

    update(player, time, delta) {
        if (this.isDead || !this.body || this.isKnockedBack) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Don't do anything else while attacking
        if (this.isAttacking) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                this.setVelocity(0, 0);
            }
            return;
        }

        // Close enough to attack
        if (dist <= this.attackRange) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                this.setVelocity(0, 0);
            }

            if (!this.isInvincible && time - this.lastAttackTime > this.attackCooldown) {
                this.startAttack(time, player);
            }

            return;
        }

        // In range to chase — call only one behavior!
        if (dist < this.chaseRange) {
            this.startChase(player);
        } else {
            this.startIdle();
        }
    }


    startIdle() {
        if (this.isChasing) return; // ⛔ don’t idle if chasing
        this.setVelocity(0, 0);
        if (!this.anims.isPlaying || this.anims.currentAnim.key !== "archer_idle") {
            this.play("archer_idle");
        }
        this.isChasing = false;
        this.isAttacking = false;
    }


    startChase(player) {
        if (this.isAttacking) {
            return;
        }

        if (!this.isChasing) {
            this.play("archer_run", true);
            this.isChasing = true;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;

        if (!this.body) {
            console.warn("[Chase] No body found!");
            return;
        }

        this.setVelocity(vx, vy);

        // Flip sprite depending on direction
        this.flipX = player.x < this.x;
    }


    startAttack(currentTime, player) {
        if (this.isDead || this.isInvincible || this.isAttacking) return;

        this.isAttacking = true;
        this.hasFiredProjectile = false;
        this.lastAttackTime = currentTime;

        this.setVelocity(0, 0);
        if (this.body) this.body.stop();

        this.off("animationupdate");
        this.off("animationcomplete-attack");

        this.play("archer_attack", true);

        this.on("animationupdate", (anim, frame) => {
            if (anim.key === "archer_attack" && frame.index === 3 && !this.hasFiredProjectile) {
                this.shootProjectileAt(player);
                this.hasFiredProjectile = true;
            }
        });

        this.once("animationcomplete-attack", () => {
            this.isAttacking = false;
            this.play("archer_idle", true);
            this.setVelocity(0, 0);
        });

        // 🛡 Failsafe: Cancel old one and set a new one
        if (this.attackFailsafeTimer) {
            this.attackFailsafeTimer.remove();
        }

        this.attackFailsafeTimer = this.scene.time.delayedCall(1200, () => {
            if (!this.active || this.isDead) return;

            if (this.isAttacking) {
                console.warn("Failsafe: attack state cleared");
                this.isAttacking = false;
                this.play("archer_idle", true);
            }
        });
    }






    shootProjectileAt(target) {
        const projectile = this.scene.archerProjectiles.create(this.x, this.y, "archer_projectile");

        if (this.flipX == true) projectile.flipX = true;
        projectile.damage = 10;

        // projectile.setOrigin(0.5, 0.5);

        projectile.setScale(3);
        projectile.setOrigin(0.5, 0.5);
        projectile.setSize(25, 5);

        this.scene.physics.moveToObject(projectile, target, 400);


        projectile.play("projectile", true);

        projectile.lifespan = 2000;
        this.scene.time.delayedCall(projectile.lifespan, () => {
            projectile.destroy();
        });
    }

    takeDamage(amount, source) {
        console.log("Damage source:", source);
        if (this.isDead || this.isInvincible) return;


        this.health -= amount;
        this.isKnockedBack = true;
        this.applyKnockback(source);


        this.isInvincible = true;
        this.play('archer_hurt');

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "archer_hurt", () => {
            if (!this.isDead) {
                this.isKnockedBack = false;
                this.play("archer_idle");
            } 
        })


        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
        });

        if (this.health <= 0) {
            this.die();
        }
    }


    die() {

        if (this.attackFailsafeTimer) {
            this.attackFailsafeTimer.remove();
            this.attackFailsafeTimer = null;
        }
        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.enable = false;

        this.play("archer_death");

        // Add archer score to scene
        if (this.scene && typeof this.scene.addScore === "function") this.scene.addScore(10);

        this.once("animationcomplete-archer_death", () => {
            this.destroy();
        })
    }

    applyKnockback(source, power = 200, duration = 200) {

        if (!source || typeof source.x !== "number" || typeof source.y !== "number") {
        console.warn("Invalid knockback source:", source);
        return;
    }

        const angle = Phaser.Math.Angle.Between(source.x, source.y, this.x, this.y);
        const vx = Math.cos(angle) * power;
        const vy = Math.sin(angle) * power;

    console.log("Applying knockback from:", source.x, source.y, "to:", this.x, this.y);

        this.setVelocity(vx, vy);

        this.scene.time.delayedCall(duration, () => {
            this.setVelocity(0, 0);
        })
    }
}
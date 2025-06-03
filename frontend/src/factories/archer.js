import Phaser from "phaser";

export default class Archer extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "archer_idle", "idle_1");

        scene.add.existing(this);
        scene.physics.add.existing(this, false);

        this.body.setAllowGravity(false); // optional
this.body.setImmovable(false);    // must be false for dynamic
this.body.setCollideWorldBounds(true); // optional

// Force the body to be dynamic
this.body.setVelocity(0, 0); // required to nudge Arcade into recognizing motion


        console.log("Body enabled:", this.body.enable);
console.log("Body type:", this.body.type === Phaser.Physics.Arcade.DYNAMIC_BODY ? "Dynamic" : "Static");



        this.setCollideWorldBounds(true);

        this.speed = 200; // walk speed
        this.chaseRange = 1000; // chase speed when player gets close to archer
        this.attackRange = 600; // range in which the archer starts his attack
        this.attackCooldown = 1000; // milliseconds between archers attacks
        this.lastAttackTime = 0; // track archers last attack

        this.body.setMaxVelocity(this.speed, this.speed);

        this.setScale(3);
        this.setOrigin(0.5, 0.5);
        // archer flags
        this.isAttacking = false;
        this.isChasing = false;

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNames("archer_idle", {
                start: 1,
                end: 6,
                prefix: "idle_"
            }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNames("archer_run", {
                start: 1,
                end: 6,
                prefix: "run_"
            }),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNames("archer_death", {
                start: 1,
                end: 7,
                prefix: "death_"
            }),
            frameRate: 7,
        })

        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNames("archer_attack", {
                start: 1,
                end: 7,
                prefix: "attack_"
            }),
            frameRate: 7,
        })

        this.play("idle");
    }

    update(player, time, delta) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (this.isAttacking) {
            this.setVelocity(0, 0); // safer than body.stop()
            return;
        }

        if (dist <= this.attackRange) {
            this.setVelocity(0, 0);

            if (time - this.lastAttackTime > this.attackCooldown) {
                this.startAttack(time, player);
            }

            return;
        }

        if (dist < this.chaseRange) {
            this.startChase(player);
        } else {
            this.startIdle();
        }
    }

    startIdle() {
        this.setVelocity(0, 0);
        if (!this.anims.isPlaying || this.anims.currentAnim.key !== "idle") {
            this.play("idle");
        }
        this.isChasing = false;
        this.isAttacking = false;
    }

    startChase(player) {
        if (this.isAttacking) return;

        if (!this.isChasing) {
            this.play("run", true);
            this.isChasing = true;
        }

        // Calculate direction manually
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;

        this.setVelocity(vx, vy);

        

        // Flip sprite based on direction
        this.flipX = player.x < this.x;
    }

    startAttack(currentTime, player) {
        this.isAttacking = true;
        this.hasFiredProjectile = false;
        this.lastAttackTime = currentTime;

        // Stop any movement
        this.body.stop();
        this.setVelocity(0, 0);

        // ── Remove any old listeners ──
        this.off("animationupdate");
        this.off("animationcomplete-attack");

        // ── Listen to every frame update and filter for attack frames ──
        this.on("animationupdate", (anim, frame) => {
            // DEBUG: log all animation‐update events

            // Only fire when we're in the "attack" animation and reach frame index 3
            if (anim.key === "attack" && frame.index === 3 && !this.hasFiredProjectile) {
                this.shootProjectileAt(player);
                this.hasFiredProjectile = true;
            }
        });

        // ── When the attack animation completes, go back to idle ──
        this.once("animationcomplete-attack", () => {
            this.isAttacking = false;
            this.play("idle", true);
        });

        // ── Now play the attack animation ──
        this.play("attack", true);
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
}
import phaser from 'phaser';

export default class Slime extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "slime_idle", "slime_idle_1");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 100; // Barrel Knights walking speed

        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(false);

            this.setCollideWorldBounds(true);
            this.body.setMaxVelocity(this.speed, this.speed);
        }

        this.isDead = false; // Flag for if the knight is dead
        this.health = 20; // Barrel Knight's health pool...adjustable if needed

        this.isInvincible = false; // Invincibility flag
        this.invincibilityDuration = 300;
        this.chaseRange = 1000; // chase range from player to chase them
        this.attackRange = 100; // range to start attacking player
        this.attackCooldown = 2500; // ms between barrel knight attacks
        this.lastAttackTime = 0; // track barrel knight last attack
        this.isKnockedBack = false;
        this.knockbackMultiplier = 0.4;
        this.damage = 10;
        this.knockback = 100;
        this.hasDealtDamage = false;

        this.setScale(3);
        this.setOrigin(0.5, 0.5);

        // Barrel Knight flags
        this.isAttacking = false;
        this.isChasing = false;

        this.play("slime_idle", true);
    }

    update(player, time, delta) {
        if (this.isDead || !this.body || this.isKnockedBack) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Don't do anything else while attacking
        if (this.isAttacking) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) this.setVelocity(0, 0);

            return;
        }

        // Close enough to attack
        if (dist <= this.attackRange) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) this.setVelocity(0, 0);

            if (!this.isInvincible && time - this.lastAttackTime > this.attackCooldown) this.startAttack(time, player);

            return;
        }

        dist < this.chaseRange ? this.startChase(player) : this.startIdle();
    }

    startIdle() {
        if (this.isChasing) return; // Don't go idle if chasing player

        this.setVelocity(0, 0);

        if (!this.anims.isPlaying || this.anims.currentAnim.key !== "slime_idle") this.play("slime_idle");

        this.isChasing = false;
        this.isAttacking = false;
    }

    startChase(player) {
        if (this.isAttacking) return;

        if (!this.isChasing) {
            this.play("slime_hop", true);
            this.isChasing = true;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;

        if (!this.body) return;

        this.setVelocity(vx, vy);

        // Flip sprite depending on direction
        this.flipX = player.x < this.x;
    }

    startAttack(currentTime, player) {
    if (this.isDead || this.isInvincible || this.isAttacking) return;

    this.isAttacking = true;
    this.lastAttackTime = currentTime;
    this.setVelocity(0, 0);
    if (this.body) this.body.stop();

    this.play("slime_attack", true);
    this.hasHitPlayer = false;

    // Clean up any previous hitbox or listeners
    if (this.attackHitbox) {
        this.attackHitbox.destroy();
        this.attackHitbox = null;
    }

    const attackFrame = 6; // frame index where hitbox spawns
    const destroyHitbox = () => {
        if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = null;
        }
    };

    const handleHit = (hitbox, target) => {
        if (!this.hasHitPlayer) {
            this.hasHitPlayer = true;
            target.takeDamage(this.damage, this);

            // Knockback
            const angle = Phaser.Math.Angle.Between(hitbox.x, hitbox.y, target.x, target.y);
            const vx = Math.cos(angle) * hitbox.knockback;
            const vy = Math.sin(angle) * hitbox.knockback;

            target.setVelocity(vx, vy);
            this.scene.time.delayedCall(200, () => {
                target.setVelocity(0, 0);
            });

            destroyHitbox();
        }
    };

    const onAnimUpdate = (anim, frame) => {
        if (frame.index === attackFrame && !this.attackHitbox) {
            const hitbox = this.spawnAttackHitbox(player, this.damage, this.knockback);

            this.attackHitbox = hitbox;
            this.scene.physics.add.overlap(hitbox, player, handleHit);

            // Optional: Visual debug
            // hitbox.setFillStyle(0xff0000, 0.5);
        }
    };

    const onAnimComplete = () => {
        this.off("animationupdate", onAnimUpdate);
        this.isAttacking = false;
        this.hasHitPlayer = false;
        destroyHitbox();
        this.play("slime_idle", true);
    };

    this.on("animationupdate", onAnimUpdate);
    this.once("animationcomplete-slime_attack", onAnimComplete);

    // Failsafe
    if (this.attackFailsafeTimer) this.attackFailsafeTimer.remove();
    this.attackFailsafeTimer = this.scene.time.delayedCall(1200, () => {
        if (!this.active || this.isDead) return;
        if (this.isAttacking) {
            this.off("animationupdate", onAnimUpdate);
            onAnimComplete();
        }
    });
}



    takeDamage(amount, source) {
        if (this.isDead || this.isInvincible) return;

        this.health -= amount;
        this.isKnockedBack = true;
        this.applyKnockback(source);

        this.isInvincible = true;
        this.play("slime_hurt");

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "slime_hurt", () => {
            if (!this.isDead) {
                this.isKnockedBack = false;
                this.play("slime_idle");
            }
        })

        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
        })

        if (this.health <= 0) this.die();
    }

    die() {
        if (this.attackFailsafeTimer) {
            this.attackFailsafeTimer.remove();
            this.attackFailsafeTimer = null;
        }

        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.enable = false;

        this.play("slime_death");

        // Add barrel knight score to scene
        if (this.scene && typeof this.scene.addScore === 'function') this.scene.addScore(40);

        this.once("animationcomplete-slime_death", () => {
            this.destroy();
        })
    }

    applyKnockback(source, power = 100, duration = 150) {
        if (!source || typeof source.x !== "number" || typeof source.y !== "number") return;

        const angle = Phaser.Math.Angle.Between(source.x, source.y, this.x, this.y);
        const vx = Math.cos(angle) * power;
        const vy = Math.sin(angle) * power;

        this.setVelocity(vx * this.knockbackMultiplier, vy * this.knockbackMultiplier);

        this.scene.time.delayedCall(duration, () => {
            this.setVelocity(0, 0);
        })
    }

    spawnAttackHitbox(player, damage, knockback) {
    const offsetX = this.flipX ? -60 : 60;

    const hitbox = this.scene.add.zone(this.x + offsetX, this.y, 40, 30);
    hitbox.setOrigin(0.5);

    this.scene.physics.add.existing(hitbox);
    hitbox.damage = damage;
    hitbox.knockback = knockback;

    this.scene.knightHitBoxes.add(hitbox);
    this.attackHitbox = hitbox;

    return hitbox; // Useful if you want to handle it in startAttack
}

}
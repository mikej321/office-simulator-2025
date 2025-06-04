export default class TypewriterText {
    constructor(scene, x, y, text, style = {}, speed = 50, onComplete = null) {
        this.scene = scene;
        this.fullText = text;
        this.speed = speed;
        this.onComplete = onComplete;
        this.index = 0;

        this.padding = 40;
        this.maxWidth = style.wordWrap?.width || 300;

        // Step 1: Create temporary text to measure size
        const measureText = scene.add.text(0, 0, text, style).setWordWrapWidth(this.maxWidth);
        const bounds = measureText.getBounds();
        measureText.destroy();

        const bgWidth = bounds.width + this.padding * 2;
        const bgHeight = bounds.height + this.padding * 2;

        // Step 2: Draw background bubble
        this.bubble = scene.add.graphics();
        this.bubble.fillStyle(0xffffff, 1);
        this.bubble.lineStyle(2, 0x000000, 1);
        this.bubble.fillRoundedRect(x, y, bgWidth, bgHeight, 16);
        this.bubble.strokeRoundedRect(x, y, bgWidth, bgHeight, 16);

        // Step 3: Create the actual text object
        this.textObject = scene.add.text(x + this.padding, y + this.padding, '', style);

        // Step 4: Start typing
        this.typingTimer = scene.time.addEvent({
            delay: this.speed,
            repeat: this.fullText.length - 1,
            callback: () => {
                this.index++;
                this.textObject.setText(this.fullText.substring(0, this.index));

                if (this.index === this.fullText.length && this.onComplete) {
                    this.onComplete();
                }
            }
        });
    }

    finishImmediately() {
        if (this.typingTimer) {
            this.typingTimer.remove();
        }
        this.textObject.setText(this.fullText);
        if (this.onComplete) this.onComplete();
    }

    destroy() {
        if (this.typingTimer) {
            this.typingTimer.remove();
        }
        this.textObject.destroy();
        this.bubble.destroy();
    }
}

/**
 * InputField factory class for creating interactive text input fields with cursor.
 * Used across different scenes for consistent input behavior.
 */
class InputField {
  /**
   * Creates a new InputField instance.
   * @param {Phaser.Scene} scene - The scene to add the input field to
   * @param {Object} options - Configuration options
   * @param {number} options.x - X position of the input field
   * @param {number} options.y - Y position of the input field
   * @param {number} options.width - Width of the input box
   * @param {number} options.height - Height of the input box
   * @param {string} options.label - Label text for the input field
   * @param {string} options.initialValue - Initial value of the input
   * @param {boolean} [options.isPassword=false] - Whether this is a password field
   * @param {number} [options.maxLength=32] - Maximum length of input
   * @param {Function} [options.onChange] - Callback when input changes
   * @param {boolean} [options.showLabel=true] - Whether to show the label
   * @param {boolean} [options.centerText=false] - Whether to center the text in the box
   */
  constructor(scene, options) {
    this.scene = scene;
    this.options = {
      isPassword: false,
      maxLength: 32,
      onChange: () => {},
      showLabel: true,
      centerText: false,
      ...options,
    };

    this.value = this.options.initialValue || "";
    this.active = false;
    this.cursor = null;
    this.keyboardListener = null;

    this.createInputField();
  }

  /**
   * Creates the input field UI elements.
   * @private
   */
  createInputField() {
    const { x, y, width, height, label, showLabel, centerText } = this.options;

    // Create input box
    this.box = this.scene.add
      .rectangle(x, y, width, height, 0x444444, 1)
      .setOrigin(0.5)
      .setInteractive();
    this.box.setStrokeStyle(2, 0xaaaaaa);
    this.box.on("pointerdown", () => this.focus());

    // Create label (optional)
    if (showLabel) {
      this.label = this.scene.add
        .text(x - width / 2 - 30, y, label + ":", {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "Fredoka",
        })
        .setOrigin(0, 0.5);
    } else {
      this.label = null;
    }

    // Create input text
    let textX;
    if (centerText) {
      textX = x;
    } else {
      textX = x - width / 2 + 12;
    }
    this.text = this.scene.add
      .text(
        textX,
        y,
        this.options.isPassword ? "•".repeat(this.value.length) : this.value,
        {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "Fredoka",
          maxLines: 1,
        }
      )
      .setOrigin(centerText ? 0.5 : 0, 0.5)
      .setInteractive();
    this.text.on("pointerdown", () => this.focus());
  }

  /**
   * Focuses the input field and sets up keyboard input.
   */
  focus() {
    if (this.active) return;
    this.active = true;
    this.text.setColor("#ffff00");
    this.box.setStrokeStyle(2, 0xffff00);

    // Create cursor
    if (this.cursor) {
      this.cursor.destroy();
    }
    let cursorX;
    if (this.options.centerText) {
      // Centered text: cursor is after text, centered
      cursorX = this.text.x + this.text.displayWidth / 2;
    } else {
      // Left-aligned text
      cursorX = this.text.x + this.text.width;
    }
    this.cursor = this.scene.add
      .rectangle(cursorX, this.text.y, 2, 28, 0xffff00)
      .setOrigin(0, 0.5);

    // Animate cursor
    this.cursor.blinkTween = this.scene.tweens.add({
      targets: this.cursor,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Set up keyboard listener
    if (this.keyboardListener) {
      this.scene.input.keyboard.off("keydown", this.keyboardListener);
    }
    this.keyboardListener = (event) => {
      if (!this.active) return;
      if (event.key === "Backspace") {
        this.value = this.value.slice(0, -1);
      } else if (event.key === "Enter") {
        this.blur();
        return;
      } else if (
        event.key.length === 1 &&
        this.value.length < this.options.maxLength
      ) {
        this.value += event.key;
      }
      this.updateText();
      this.options.onChange(this.value);
    };
    this.scene.input.keyboard.on("keydown", this.keyboardListener);
  }

  /**
   * Removes focus from the input field.
   */
  blur() {
    if (!this.active) return;
    this.active = false;
    this.text.setColor("#ffffff");
    this.box.setStrokeStyle(2, 0xaaaaaa);
    if (this.cursor) {
      this.cursor.destroy();
      this.cursor = null;
    }
    if (this.keyboardListener) {
      this.scene.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  /**
   * Updates the displayed text.
   * @private
   */
  updateText() {
    this.text.setText(
      this.options.isPassword ? "•".repeat(this.value.length) : this.value
    );
    if (this.cursor) {
      let cursorX;
      if (this.options.centerText) {
        cursorX = this.text.x + this.text.displayWidth / 2;
      } else {
        cursorX = this.text.x + this.text.width;
      }
      this.cursor.x = cursorX;
    }
  }

  /**
   * Gets the current value of the input field.
   * @returns {string} The current input value
   */
  getValue() {
    return this.value;
  }

  /**
   * Sets the value of the input field.
   * @param {string} value - The new value
   */
  setValue(value) {
    this.value = value;
    this.updateText();
  }

  /**
   * Destroys the input field and cleans up resources.
   */
  destroy() {
    this.blur();
    if (this.box) this.box.destroy();
    if (this.label) this.label.destroy();
    if (this.text) this.text.destroy();
  }
}

export default InputField;

import Phaser from "phaser";
import WebFont from "webfontloader";

class AccountScene extends Phaser.Scene {
  constructor() {
    // Calls the Phaser.Scene constructor with the scene key "AccountScene"
    // Registers this scene with Phaser's scene manager
    super({
      key: "AccountScene",
    });
    console.log("AccountScene constructor called");
    this.formData = {
      email: "",
      password: "",
      characterName: "",
    };
    this.errorText = null;
    this.mode = "signup"; // Default mode
  }

  init(data) {
    // Set mode based on how we got here
    this.mode = data?.mode || "signup";
  }

  preload() {
    console.log("AccountScene preload started");
    // Use WebFontLoader to load fonts before proceeding
    this.fontsLoaded = false;

    WebFont.load({
      google: {
        families: ["Chewy", "Fredoka:wght@300,400,500,600,700"],
      },
      active: () => {
        console.log("Fonts loaded in AccountScene");
        this.fontsLoaded = true;
        this.startMenu();
      },
      inactive: () => {
        console.error("Font loading failed in AccountScene");
        this.fontsLoaded = true;
        this.startMenu();
      },
    });
  }

  create() {
    console.log("AccountScene create started");
    this.formData = { email: "", password: "", characterName: "" };
    this.activeInput = null;
    this.keyboardListener = null;
    this.menuStarted = false;
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.fontsLoaded) {
          if (!this.menuStarted) {
            console.log("Starting AccountScene menu");
            this.menuStarted = true;
            this.startMenu();
          }
        } else {
          this.time.delayedCall(50, this.create, [], this);
        }
      },
    });
  }

  startMenu() {
    console.log("AccountScene startMenu called");
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add
      .text(
        width / 2,
        height / 4,
        this.mode === "signup" ? "New Account" : "Sign In",
        {
          fontSize: "48px",
          color: "#ffffff",
          fontFamily: "Fredoka",
        }
      )
      .setOrigin(0.5);
    console.log("Title text created");

    // Back button
    this.backButton = this.add
      .text(50, 50, "← Back", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    console.log("Back button created");

    this.backButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.backButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.backButton.on("pointerdown", () => {
      this.scene.transition({
        target: "MainMenuScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Form container
    this.formContainer = this.add.container(width / 2, height / 2);

    // Phaser-only input fields
    this.inputFields = [
      { key: "email", label: "Email", y: -50, isPassword: false },
      { key: "password", label: "Password", y: 30, isPassword: true },
    ];
    this.inputBoxes = {};
    this.inputTexts = {};
    this.activeInput = null;
    this.keyboardListener = null;

    this.inputFields.forEach((field) => {
      const labelX = -150;
      const inputX = 100;
      // Draw box
      const boxWidth = 240;
      const boxHeight = 44;
      const boxY = field.y;
      const box = this.add
        .rectangle(inputX, boxY, boxWidth, boxHeight, 0x444444, 1)
        .setOrigin(0.5)
        .setInteractive();
      box.setStrokeStyle(2, 0xaaaaaa);
      box.on("pointerdown", () => this.focusInputField(field.key));
      this.formContainer.add(box);
      this.inputBoxes[field.key] = box;
      // Label
      const label = this.add
        .text(labelX, boxY, field.label + ":", {
          fontSize: "24px",
          color: "#ffffff",
          fontFamily: "Fredoka",
        })
        .setOrigin(0, 0.5);
      this.formContainer.add(label);
      // Text
      const text = this.add
        .text(
          inputX - boxWidth / 2 + 12,
          boxY,
          this.formData[field.key] || "",
          {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Fredoka",
            fixedWidth: boxWidth - 24,
            maxLines: 1,
          }
        )
        .setOrigin(0, 0.5)
        .setInteractive();
      text.on("pointerdown", () => this.focusInputField(field.key));
      this.formContainer.add(text);
      this.inputTexts[field.key] = text;
    });

    // Transparent overlay for blur
    this.inputOverlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setOrigin(0.5)
      .setDepth(10000)
      .setInteractive();
    this.inputOverlay.visible = false;
    this.inputOverlay.on("pointerdown", () => this.blurInputField());

    // Submit button
    this.submitButton = this.add
      .text(0, 150, this.mode === "signup" ? "Create Account" : "Sign In", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.submitButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.submitButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.submitButton.on("pointerdown", () => {
      this.handleSubmit();
    });

    // Error text
    this.errorText = this.add
      .text(0, 200, "", {
        fontSize: "20px",
        color: "#ff0000",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Add all elements to the container
    this.formContainer.add([this.submitButton, this.errorText]);

    // Listen for resize events
    this.scale.on("resize", this.resize, this);
  }

  focusInputField(key) {
    if (this.activeInput === key) return;
    this.blurInputField();
    this.activeInput = key;
    this.inputTexts[key].setColor("#ffff00");
    this.inputOverlay.visible = true;
    if (this.keyboardListener) {
      this.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
    this.keyboardListener = (event) => {
      if (this.activeInput !== key) return;
      if (event.key === "Backspace") {
        this.formData[key] = (this.formData[key] || "").slice(0, -1);
      } else if (event.key === "Enter") {
        this.blurInputField();
        return;
      } else if (
        event.key.length === 1 &&
        (this.formData[key] || "").length < 32
      ) {
        this.formData[key] = (this.formData[key] || "") + event.key;
      }
      this.inputTexts[key].setText(
        key === "password"
          ? "•".repeat((this.formData[key] || "").length)
          : this.formData[key]
      );
    };
    this.input.keyboard.on("keydown", this.keyboardListener);
  }

  blurInputField() {
    if (!this.activeInput) return;
    this.inputTexts[this.activeInput].setColor("#ffffff");
    this.inputOverlay.visible = false;
    if (this.keyboardListener) {
      this.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
    this.activeInput = null;
  }

  async handleSubmit() {
    console.log("Submit button clicked");
    // Validate form
    if (!this.formData.email || !this.formData.password) {
      this.showError("Email and password are required");
      return;
    }
    if (!this.validateEmail(this.formData.email)) {
      this.showError("Invalid email format");
      return;
    }
    if (this.formData.password.length < 6) {
      this.showError("Password must be at least 6 characters");
      return;
    }
    try {
      // Disable submit button and show loading state
      this.submitButton.setStyle({ color: "#666666" });
      this.submitButton.setText(
        this.mode === "signup" ? "Creating Account..." : "Signing In..."
      );
      this.submitButton.disableInteractive();
      console.log(`Attempting to ${this.mode}...`);
      const endpoint = this.mode === "signup" ? "signup" : "login";
      const response = await fetch(
        `http://localhost:8000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.formData.email,
            password: this.formData.password,
          }),
        }
      );
      const data = await response.json();
      console.log("Server response:", data);
      if (!response.ok) {
        throw new Error(
          data.message || data.errors?.[0]?.msg || `Failed to ${this.mode}`
        );
      }
      // Store the token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Show success message
      this.submitButton.setText(
        this.mode === "signup" ? "Account Created!" : "Signed In!"
      );
      this.submitButton.setStyle({ color: "#00ff00" });
      // Add a small delay before transitioning
      this.time.delayedCall(1000, () => {
        // Use standard Phaser scene transition
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
          this.scene.start("PlayerMenuScene");
        });
      });
    } catch (error) {
      console.error(`Error during ${this.mode}:`, error);
      this.showError(error.message);
      // Reset submit button
      this.submitButton.setStyle({ color: "#00ff00" });
      this.submitButton.setText(
        this.mode === "signup" ? "Create Account" : "Sign In"
      );
      this.submitButton.setInteractive();
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showError(message) {
    this.errorText.setText(message);
    this.tweens.add({
      targets: this.errorText,
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: "Power2",
    });
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.titleText) {
      this.titleText.setPosition(width / 2, height / 4);
    }

    if (this.formContainer) {
      this.formContainer.setPosition(width / 2, height / 2);
    }
  }

  // Clean up on shutdown
  shutdown() {
    this.blurInputField();
  }
}

export default AccountScene;

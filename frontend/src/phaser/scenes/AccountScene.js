import Phaser from "phaser";
import WebFont from "webfontloader";

class AccountScene extends Phaser.Scene {
  constructor() {
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

    // Create input fields
    this.createInputField("email", -100, "Email");
    this.createInputField("password", -20, "Password", true);

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

    // Add keyboard input handling
    this.input.keyboard.on("keydown", this.handleKeyDown, this);
  }

  createInputField(fieldName, yOffset, label, isPassword = false) {
    console.log(`Creating input field: ${fieldName}`);
    const labelText = this.add
      .text(-150, yOffset, label + ":", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0, 0.5);

    const inputText = this.add
      .text(0, yOffset, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
        backgroundColor: "#333",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0, 0.5)
      .setInteractive();

    this.formContainer.add([labelText, inputText]);

    // Store reference to input text
    this[fieldName + "Input"] = inputText;

    // Add click handler
    inputText.on("pointerdown", () => {
      console.log(`Input field clicked: ${fieldName}`);
      this.activeInput = fieldName;
      this.showKeyboard(fieldName, isPassword);
    });
  }

  showKeyboard(fieldName, isPassword) {
    // Create a temporary input element
    const input = document.createElement("input");
    input.type = isPassword ? "password" : "text";
    input.style.position = "absolute";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    document.body.appendChild(input);

    // Focus the input
    input.focus();

    // Handle input
    input.oninput = (e) => {
      this.formData[fieldName] = e.target.value;
      this[fieldName + "Input"].setText(
        isPassword ? "•".repeat(e.target.value.length) : e.target.value
      );
    };

    // Handle blur
    input.onblur = () => {
      document.body.removeChild(input);
      this.activeInput = null;
    };
  }

  handleKeyDown(event) {
    if (this.activeInput) {
      const input = this[this.activeInput + "Input"];
      if (event.key === "Backspace") {
        this.formData[this.activeInput] = this.formData[this.activeInput].slice(
          0,
          -1
        );
        input.setText(
          this.activeInput === "password"
            ? "•".repeat(this.formData[this.activeInput].length)
            : this.formData[this.activeInput]
        );
      }
    }
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
}

export default AccountScene;

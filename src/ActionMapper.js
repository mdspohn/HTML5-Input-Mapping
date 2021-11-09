class ActionMapper {
    constructor() {
        this.gamepad = new Object();

        this.gamepad.axes = new Object();
        this.gamepad.axes[0] = ''; // Left Stick Horizontal Axis
        this.gamepad.axes[1] = ''; // Left Stick Vertical Axis
        this.gamepad.axes[2] = ''; // Right Stick Horizontal Axis
        this.gamepad.axes[3] = ''; // Right Stick Vertical Axis

        this.gamepad.buttons = new Object();
        this.gamepad.buttons[0]  = ''; // Action Bottom
        this.gamepad.buttons[1]  = ''; // Action Right
        this.gamepad.buttons[2]  = ''; // Action Left
        this.gamepad.buttons[3]  = ''; // Action Top
        this.gamepad.buttons[4]  = ''; // Bumper Left
        this.gamepad.buttons[5]  = ''; // Bumper Right
        this.gamepad.buttons[6]  = ''; // Trigger Left
        this.gamepad.buttons[7]  = ''; // Trigger Right
        this.gamepad.buttons[8]  = ''; // Select
        this.gamepad.buttons[9]  = ''; // Start
        this.gamepad.buttons[10] = ''; // Stick Left
        this.gamepad.buttons[11] = ''; // Stick Right
        this.gamepad.buttons[12] = ''; // D-Pad Top
        this.gamepad.buttons[13] = ''; // D-Pad Bottom
        this.gamepad.buttons[14] = ''; // D-Pad Left
        this.gamepad.buttons[15] = ''; // D-Pad Right
        this.gamepad.buttons[16] = ''; // System (Caught by Windows OS Gaming)

        this.keyboard = new Object();
        this.keyboard[0] = '';

        window.addEventListener('device-input', (event) => {
            this.map
        });
    }
}
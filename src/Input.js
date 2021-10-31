class InputManager {
    static instance = null;
    static autoConnectKeyboard = false;
    
    constructor() {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Device Connection Options
        this.maxDevices = 1;
        this.ignoreInput = false;
        this.allowDeviceSwapping = true;

        // Recognized Devices
        this.keyboard = new Keyboard();
        this.gamepads = new Object();
        this.gamepads[0] = new Gamepad();
        this.gamepads[1] = new Gamepad();
        this.gamepads[2] = new Gamepad();
        this.gamepads[3] = new Gamepad();

        // Connected Devices
        this.slots = new Array(4).fill(null);

        if (InputManager.autoConnectKeyboard === true)
            this.slots[0] = this.keyboard;

        // Mouse Events
        document.addEventListener('mousemove',   (e) => e);
        document.addEventListener('mouseout',    (e) => e);
        document.addEventListener('click',       (e) => e);
        document.addEventListener('mousedown',   (e) => e);
        document.addEventListener('mouseup',     (e) => e);
        document.addEventListener('contextmenu', (e) => e);
        document.addEventListener('wheel',       (e) => e, { passive: true });

        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            // determine if we are/should be listening to keyboard input, then dispatch event
            if (this.isConnected(this.keyboard))
                this.keyboard.pressed(e);
        });
        document.addEventListener('keyup', (e) => {
            this.keyboard.released(e);
        });

        // Gamepad Events
        window.addEventListener('gamepadconnected',    (e) => this.gamepads[e.gamepad.index].use(e.gamepad));
        window.addEventListener('gamepaddisconnected', (e) => this.gamepads[e.gamepad.index].disable());
    }

    isConnected(device) {
        const connected = this.slots.some(slot => typeof slot === typeof device && slot.gpindex === device.gpindex);
        if (!connected && !this.ignoreInput) {
            let slotIndex = this.slots.findIndex((slot, index) => slot === null && index < this.maxDevices);
            if (slotIndex !== -1 || this.allowDeviceSwapping === true) {
                device.reset();
                device.enable();
                if (slotIndex === -1) {
                    slotIndex = 0;
                    this.slots[0].disable();
                }
                this.slots[slotIndex] = device;

                return true;
            }
        }

        return false;
    }

    update(step) {
        this.keyboard.update(step);
        Object.values(this.gamepads).forEach(gamepad => {
            gamepad.update(step);
            if (!gamepad.hasActivity() || !this.isConnected(gamepad))
                return;
        });

    }
}
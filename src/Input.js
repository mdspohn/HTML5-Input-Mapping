class InputManager {
    static instance = null;
    
    constructor(opts) {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Device Connection Options
        this.maxDevices = 2;
        this.ignoreInput = false;
        this.allowDeviceSwapping = true;
        this.autoConnectKeyboard = false;

        // Recognized Devices
        this.keyboard = new Keyboard();
        this.gamepads = new Object();
        this.gamepads[0] = new Gamepad();
        this.gamepads[1] = new Gamepad();
        this.gamepads[2] = new Gamepad();
        this.gamepads[3] = new Gamepad();

        // Connected Devices
        this.slots = new Array(4).fill(null);

        if (this.autoConnectKeyboard === true)
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
                return;
        });
        document.addEventListener('keyup', (e) => {
        });

        // Gamepad Events
        window.addEventListener('gamepadconnected',    (e) => this.gamepads[e.gamepad.index].use(e.gamepad));
        window.addEventListener('gamepaddisconnected', (e) => {
            const id = this.slots.findIndex(device => device.index === e.gamepad.index);
            this.disconnect(id);
        });
    }

    isConnected(device) {
        // determine if this device should be listened to
        if (this.ignoreInput)
            return false;
        
        const connected = this.slots.some(slot => (slot !== null && typeof slot === typeof device) && slot.index === device.index);
        if (!connected) {
            const id = this.slots.findIndex((slot, index) => slot === null && index < this.maxDevices);
            if (id !== -1 || this.allowDeviceSwapping) {
                const slot = (id !== -1) ? id : 0;
                this.disconnect(slot);
                this.connect(slot, device);
                return true;
            }
            return false;
        }

        return true;
    }

    connect(id, device) {
        this.slots[id] = device;
        Events.dispatch('device-connected', { id, device });
    }

    disconnect(id) {
        this.slots[id] = null;
        Events.dispatch('device-disconnected', { id });
    }

    update(delta) {
        this.keyboard.update(delta);
        Object.values(this.gamepads).forEach(gamepad => {
            gamepad.update(delta);
            if (this.isConnected(gamepad))
                return;
            // if (!gamepad.hasActivity() || !this.isConnected(gamepad))
            //     return;
        });

    }
}
class DeviceManager {
    static instance = null;

    // account for drift/error on gamepad button presses
    // [n = 0.25] would normalize (0.25 - 0.75) as (0.0 - 1.0)
    static BUTTON_DRIFT = 0.25;

    // account for drift/error on gamepad axis movement
    static AXIS_DRIFT = 0.25;

    // time passed, in milliseconds, before button-held actions are registed on device-input events
    static HOLD_DELAY = 500;

    static dispatch(id, detail, cancelable = false) {
        const e = new CustomEvent(id, { detail, cancelable });
        window.dispatchEvent(e);
    }
    
    constructor() {
        if (DeviceManager.instance !== null)
            return DeviceManager.instance;
        
        DeviceManager.instance = this;

        // Connected Device
        this.connection = null;

        // Recognized Gamepads
        this.gamepads = new Object();
        this.gamepads[0] = null;
        this.gamepads[1] = null;
        this.gamepads[2] = null;
        this.gamepads[3] = null;

        // Keyboard & Mouse Management
        this.keyboard = new Keyboard();

        if (!window.navigator || !window.navigator.getGamepads)
            console.warn('Gamepad API not supported by current browser.');

        window.addEventListener('device-connection-request', (e) => {
            this.connect(e.detail.device);

            e.stopImmediatePropagation();
        }, true);
    }

    connect(device) {
        if (device === null || device.requestingConnection)
            return;

        device.requestingConnection = true;

        if (this.connection !== null) {
            this.connection.active = false;
        }

        device.active = true;
        DeviceManager.dispatch('device-connected', { previous: this.connection, device });
        this.connection = device;

        device.requestingConnection = false;
    }

    disconnect() {
        if (this.connection === null)
            return;
        
        DeviceManager.dispatch('device-disconnected', { device: this.connection });

        this.connection = null;
    }

    onGamepadFound(i, state, delta) {
        if (this.gamepads[i] === null) {
            this.gamepads[i] = new Gamepad(state);
            DeviceManager.dispatch('device-detected', { device: this.gamepads[i] });
        }

        this.gamepads[i].update(state, delta);
    }

    onGamepadMissing(i) {
        if (this.gamepads[i] instanceof Gamepad) {
            if (this.gamepads[i].active)
                this.disconnect();
            
            DeviceManager.dispatch('device-removed', { device: this.gamepads[i] });

            this.gamepads[i] = null;
        }
    }

    update(delta) {
        // check for device connection changes
        const devices = navigator.getGamepads() || new Array();
        for (let i = 0; i < devices.length; i++) {
            if (devices[i] !== null) {
                this.onGamepadFound(i, devices[i], delta);
                continue;
            }
            this.onGamepadMissing(i);
        }

        this.keyboard.update(delta);
    }
}
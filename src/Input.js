class InputManager {
    static instance = null;

    static dispatch(id, data) {
        console.log(id)
        window.dispatchEvent(new CustomEvent(id, { detail: data }));
    }
    
    constructor() {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Connected Devices
        this.connections = new Array(4).fill(null);

        // QoL Settings
        this.autoConnect = true;

        // Recognized Gamepads
        this.gamepads = new Object();
        this.gamepads[0] = null;
        this.gamepads[1] = null;
        this.gamepads[2] = null;
        this.gamepads[3] = null;

        // Keyboard & Mouse Management
        this.keyboard = new Keyboard();

        window.addEventListener('device-connection-request', (event) => {
            if (this.autoConnect !== true)
                return;

            this.connect(0, event.detail.device);
        });
    }

    /* ---------------
    * AutoConnect Mode
    * ----------------------------
    * All unconnected keyboard/gamepad activity will immediately connect the device to the first slot
    * ------------------ */

    autoConnectMode(enabled = true) {
        this.autoConnect = enabled;
    }

    connect(slot, device) {
        if (device === null || device.requestingConnection)
            return;

        device.requestingConnection = true;
        
        if (this.connections[slot] !== null) {
            this.connections[slot].connected = false;
            this.connections[slot].slot = null;
            InputManager.dispatch('device-swapped', { slot, from: this.connections[slot], to: device });
        }

        device.connected = true;
        device.slot = slot;
        this.connections[slot] = device;
        InputManager.dispatch('device-connected', { slot, device });

        device.requestingConnection = false;
    }

    disconnect(slot) {
        if (this.connections[slot] === null)
            return;
        
        const device = this.connections[slot];
        device.connected = false;
        device.slot = null;
        this.connections[slot] = null;
        InputManager.dispatch('device-disconnected', { slot, device });
    }

    onGamepadFound(i, state, delta) {
        if (this.gamepads[i] === null) {
            this.gamepads[i] = new Gamepad(state);
            InputManager.dispatch('device-detected', this.gamepads[i]);
        }

        this.gamepads[i].update(state, delta);
    }

    onGamepadMissing(i) {
        if (this.gamepads[i] instanceof Gamepad) {
            const gamepad = this.gamepads[i];
            
            if (gamepad.connected)
                this.disconnect(gamepad.slot);
            
            this.gamepads[i] = null;
            InputManager.dispatch('device-removed', gamepad);
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

        // update keyboard & send events for connected devices
        this.keyboard.update(delta);
    }
}
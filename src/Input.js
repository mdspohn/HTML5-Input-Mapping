class InputManager {
    static instance = null;

    static dispatch(id, data) {
        window.dispatchEvent(new CustomEvent(id, { detail: data }));
    }
    
    constructor() {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Connected Devices
        this.connections = new Object();
        this.connections.slots = new Array(4).fill(null);
        this.autoConnect = false;

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

    autoConnectMode(enabled = true) {
        // AUTO CONNECT MODE: Connect and broadcast all device activity
        // - This is only useful for single-user applications, as broadcasts will not be include a unique ID

        this.autoConnect = enabled;
    }

    connect(slot, device) {
        if (device === null)
            return;
        
        const previous = this.connections[slot];
        if (previous !== null) {
            previous.connected = false;
            InputManager.dispatch('device-swapped', { slot, from: previous, to: device });
        }

        device.connected = true;
        this.connections[slot] = device;
        InputManager.dispatch('device-connected', { slot, device });
    }

    disconnect(slot) {
        if (this.connections[slot] === null)
            return;
        
        const device = this.connections[slot];
        device.connected = false;
        this.connections[slot] = null;
        InputManager.dispatch('device-disconnected', { slot, device });
    }

    #onGamepadFound(i, state, delta) {
        if (this.gamepads[i] === null) {
            this.gamepads[i] = new Gamepad(state);
            InputManager.dispatch('device-detected', this.gamepads[i]);
        }

        this.gamepads[i].update(state, delta);
    }

    #onGamepadMissing(i) {
        if (this.gamepads[i] instanceof Gamepad) {
            const index = this.connections.findIndex(device => device === this.gamepads[i]),
                  isConnected = Boolean(index !== -1),
                  gamepad = this.gamepads[i];
            
            if (isConnected)
                this.disconnect(index);
            
            this.gamepads[i] = null;
            InputManager.dispatch('device-removed', gamepad);
        }
    }

    update(delta) {
        // check for device connection changes
        const devices = navigator.getGamepads() || new Array();
        for (let i = 0; i < devices.length; i++) {
            if (devices[i] !== null) {
                this.#onGamepadFound(i, devices[i], delta);
                continue;
            }
            this.#onGamepadMissing(i);
        }

        // update keyboard & send events for connected devices
        this.keyboard.update(delta);
    }
}

// Input Events
// ------------------
// button-pressed
// button-held
// button-released
// gamepad-enabled

// Input Events
// window.addEventListener('button-pressed', (e) => {
//     console.log(`Button (#${e.detail.alias}) pressed.`);
// });

// window.addEventListener('button-held', (e) => {
//     if (Math.floor(e.detail.ms / 1000) > Math.floor((e.detail.ms - e.detail.delta) / 1000))
//         console.warn(`Held for ${Math.floor(e.detail.ms / 1000)} second(s)!`);
// });

// window.addEventListener('button-released', (e) => {
//     console.error(`Button (#${e.detail.alias}) released...`);
// });

// window.addEventListener('gamepad-enabled', (e) => {
//     console.log(e.detail.gamepad.nid, e.detail.gamepad);
// });
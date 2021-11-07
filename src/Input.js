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
        this.connections.max = 1;
        this.connections.current = 0;
        this.connections.slots = new Array(4).fill(null);

        // Recognized Devices
        this.keyboard = new Keyboard();
        this.gamepads = new Object();
        this.gamepads[0] = null;
        this.gamepads[1] = null;
        this.gamepads[2] = null;
        this.gamepads[3] = null;

        window.addEventListener('device-connection-request', (event) => {
            // TODO
        });

        window.addEventListener('device-disconnected', (event) => {
            // TODO
        });
    }

    updateKeyboard(delta) {
        const changes = this.keyboard.getChanges(delta);
        changes.forEach(action => this.events.dispatch(action.id, action.data));
    }

    updateGamepad(index, state, delta) {
        const changes = this.gamepads[index].getChanges(state, delta);
        changes.forEach(action => this.events.dispatch(action.id, action.data));
    }

    addGamepad(index, state) {
        this.gamepads[index] = new Gamepad(state);
    }

    disconnectGamepad(index) {
        const connIndex = this.connections.slots.findIndex(device => device === this.gamepads[index]);
        if (connIndex !== -1) {
            this.connections.slots[connIndex] = null;
            InputManager.dispatch('device-disconnected', { device: this.gamepads[index], connIndex: connIndex });
        }
        this.gamepads[index] = null;
    }

    update(delta) {
        this.updateKeyboard(delta);

        const navgiatorGamepads = navigator.getGamepads();
        for (let i = 0; i < navgiatorGamepads.length; i++) {
            const state = navgiatorGamepads[i],
                  isEnabled = this.gamepads[i] instanceof Gamepad;

            if (state === null && !isEnabled)
                continue;
            
            if (state !== null) {
                if (isEnabled === true) {
                    this.updateGamepad(i, state, delta);
                } else {
                    this.addGamepad(i, state);
                }
                continue;
            }

            this.disconnectGamepad(i);
        }
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
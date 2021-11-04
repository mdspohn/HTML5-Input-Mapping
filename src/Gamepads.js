class Gamepad {
    static #DISCONNECTED = 0;
    static #DETECTED     = 1;
    static #CONNECTED    = 2;

    static STANDARD_MAPPING = {
        0:  'action-bottom',
        1:  'action-right',
        2:  'action-left',
        3:  'action-top',
        4:  'bumper-left',
        5:  'bumper-right',
        6:  'trigger-left',
        7:  'trigger-right',
        8:  'select',
        9:  'start',
        10: 'stick-left',
        11: 'stick-right',
        12: 'pad-top',
        13: 'pad-bottom',
        14: 'pad-left',
        15: 'pad-right',
        16: 'system'
    };
    
    constructor() {
        this.id = null;
        this.mapping = null;
        this.buttons = null;
        this.aliases = null;
        this.status = Gamepad.#DISCONNECTED;
    }

    isDisconnected() { return this.status === Gamepad.#DISCONNECTED }
    isDetected()     { return this.status === Gamepad.#DETECTED     }
    isConnected()    { return this.status === Gamepad.#CONNECTED    }

    initialize(ngp) {
        this.id = ngp.id;
        this.mapping = ngp.mapping;
        this.buttons = Array.from(new Array(ngp.buttons.length), x => {
            return new Object({ pressed: false, ms: 0 });
        });
        this.status = Gamepad.#DETECTED;
    }

    connect() {
        this.status = Gamepad.#CONNECTED;
    }

    disable() {
        this.status = Gamepad.#DETECTED;
    }

    disconnect() {
        this.status = Gamepad.#DISCONNECTED;
    }

    updateButton(i, pressed, delta) {
        if (this.buttons[i].pressed) {
            if (pressed) {
                // BUTTON HELD
                this.buttons[i].ms += delta;
                if (Math.floor(this.buttons[i].ms / 1000) > Math.floor((this.buttons[i].ms - delta) / 1000))
                    console.warn(`Held for ${Math.floor(this.buttons[i].ms / 1000)} second(s)!`);
            } else {
                // BUTTON RELEASED
                this.buttons[i].pressed = false;
                console.error(`Button (#${Gamepad.STANDARD_MAPPING[i]}) released...`);
            }
        } else if (pressed) {
            // BUTTON PRESSED
            this.buttons[i].pressed = true;
            this.buttons[i].ms = 0;
            console.log(`Button (#${Gamepad.STANDARD_MAPPING[i]}) pressed.`);
        }
    }
}

class GamepadManager {

    constructor() {
        this.gamepads = Array.from(new Array(4), x => new Gamepad());

        window.addEventListener('gamepadconnected',    (e) => { console.log(e); this.gamepads[e.gamepad.index].initialize(e.gamepad); });
        window.addEventListener('gamepaddisconnected', (e) => this.gamepads[e.gamepad.index].disconnect());
    }

    update(delta) {
        const NGP = navigator.getGamepads();
        this.gamepads.forEach((gamepad, i) => {
            if (gamepad.isConnected()) {
                NGP[i].buttons.forEach((button, bi) => gamepad.updateButton(bi, button.pressed, delta));
            } else if (gamepad.isDetected()) {
                if (NGP[i] !== null && NGP[i].buttons.some(button => button.pressed || button.value === 1))
                    this.gamepads[i].connect();
            }
        });
    }
}
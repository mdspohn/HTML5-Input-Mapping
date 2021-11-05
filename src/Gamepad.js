class Gamepad {
    static DISCONNECTED = 0;
    static DETECTED     = 1;
    static ENABLED      = 2;

    // values are converted to a number between 0 and 1 representing these clamped values
    static BUTTON_ACTIVE_MIN = 0.2;
    static BUTTON_ACTIVE_MAX = 0.7;
    static AXIS_ACTIVE_MIN = 0.2;
    static AXIS_ACTIVE_MAX = 0.7;

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
        this.id        = null;
        this.mapping   = null;
        this.axes      = null;
        this.buttons   = null;
        this.timestamp = null;
        this.status    = Gamepad.DISCONNECTED;
    }

    enable() {
        this.status = Gamepad.ENABLED;
        InputManager.dispatch('gamepad-enabled', { gamepad: this });
    }
    disable()    { this.status = Gamepad.DETECTED;     }
    disconnect() { this.status = Gamepad.DISCONNECTED; }

    isEnabled()      { return this.status === Gamepad.ENABLED;      }
    isDetected()     { return this.status === Gamepad.DETECTED;     }
    isDisconnected() { return this.status === Gamepad.DISCONNECTED; }

    initialize(ngp) {
        this.nid       = ngp.id;
        this.nindex    = ngp.index;
        this.mapping   = ngp.mapping;
        this.buttons   = Array.from(new Array(ngp.buttons.length), x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.axes      = Array.from(new Array(ngp.axes.length),    x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.timestamp = ngp.timestamp;
        this.status    = Gamepad.DETECTED;
    }

    hasChanges(ngp) {
        if (ngp === null)
            return false;

        return ngp.timestamp > this.timestamp || ngp.buttons.some(button => button.pressed);
    }

    updateAxis(i, axis, delta) {
        if (Gamepad.AXIS_ACTIVE_MIN > Math.abs(axis) && this.axes[i].intensity === 0)
            return;
    }

    updateButton(i, button, delta) {
        if (Gamepad.BUTTON_ACTIVE_MIN > button.value && this.buttons[i].intensity === 0)
            return;
        
        const range = Gamepad.BUTTON_ACTIVE_MAX - Gamepad.BUTTON_ACTIVE_MIN,
              intensity = Math.min(1, Math.max(0, button.value - Gamepad.BUTTON_ACTIVE_MIN) / range);

        const data = {
            button: i,
            alias: Gamepad.STANDARD_MAPPING[i],
            gamepad: this,
            value: this.buttons[i].value = button.value,
            intensity,
            delta,
            ms: this.buttons[i].ms += delta
        };

        if (intensity > 0) {
            if (this.buttons[i].intensity === 0) {
                this.buttons[i].intensity = intensity;
                data.ms = this.buttons[i].ms = 0;
                InputManager.dispatch('button-pressed', data);
            } else {
                InputManager.dispatch('button-held', data);
            }
        } else {
            this.buttons[i].intensity = 0;
            InputManager.dispatch('button-released', data);
        }
    }

    update(ngp, delta) {
        if (!this.hasChanges(ngp))
            return false;
        
        this.timestamp = ngp.timestamp;

        if (this.isDetected())
            return this.enable();

        ngp.axes.forEach((axis, i) => this.updateAxis(i, axis, delta));
        ngp.buttons.forEach((button, i) => this.updateButton(i, button, delta));
    }
}
class Gamepad {
    // values are converted to a number between 0 and 1 representing these clamped values
    static BUTTON_ACTIVE_MIN = 0.2;
    static BUTTON_ACTIVE_MAX = 0.7;
    static AXIS_ACTIVE_MIN = 0.2;
    static AXIS_ACTIVE_MAX = 0.7;

    static STANDARD_MAPPING = {
        "0":  "action-bottom",
        "1":  "action-right",
        "2":  "action-left",
        "3":  "action-top",
        "4":  "bumper-left",
        "5":  "bumper-right",
        "6":  "trigger-left",
        "7":  "trigger-right",
        "8":  "select",
        "9":  "start",
        "10": "stick-left",
        "11": "stick-right",
        "12": "pad-top",
        "13": "pad-bottom",
        "14": "pad-left",
        "15": "pad-right",
        "16": "system"
    };
    
    constructor(state) {
        this.nId       = state.id;
        this.nIndex    = state.index;
        this.mapping   = state.mapping;
        this.buttons   = Array.from(new Array(state.buttons.length), x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.axes      = Array.from(new Array(state.axes.length), x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.timestamp = state.timestamp;
    }

    hasChanges(state) {
        if (state === null)
            return false;

        return state.timestamp > this.timestamp || state.buttons.some(button => button.value > Gamepad.BUTTON_ACTIVE_MIN);
    }

    getChanges(state, delta) {
        const changes = new Array();
        // TODO
        return changes;
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
            if (this.buttons[i].intensity !== 0)
                return InputManager.dispatch('button-held', data);

            this.buttons[i].intensity = intensity;
            this.buttons[i].ms = data.ms = 0;
            return InputManager.dispatch('button-pressed', data);
        }

        this.buttons[i].intensity = data.intensity = 0;
        return InputManager.dispatch('button-released', data);
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
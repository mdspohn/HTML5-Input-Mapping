class Gamepad {
    // Button/Axis intensity values are normalized within this range to account for drift
    static BUTTON_ACTIVE_MIN = 0.25;
    static BUTTON_ACTIVE_MAX = 0.75;
    static AXIS_ACTIVE_MIN = 0.25;
    static AXIS_ACTIVE_MAX = 0.75;

    // Minimum amount of time passed (milliseconds) before button-held events are registered
    static HOLD_MS = 500;
    
    constructor(state) {
        // Gamepad State
        this.id        = state.id;
        this.index     = state.index;
        this.mapping   = state.mapping;
        this.buttons   = Array.from(new Array(state.buttons.length), x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.axes      = Array.from(new Array(state.axes.length), x => new Object({ value: 0, intensity: 0, ms: 0 }));
        this.timestamp = state.timestamp;

        // Connection State
        this.connected = false;
        this.slot      = null;
        this.requestingConnection = false;
    }

    hasUpdate(state) {
        if (state === null)
            return false;

        return state.timestamp > this.timestamp || state.buttons.some(button => button.value > Gamepad.BUTTON_ACTIVE_MIN);
    }

    updateAxis(i, axis, delta) {
        if (Gamepad.AXIS_ACTIVE_MIN > Math.abs(axis) && this.axes[i].intensity === 0)
            return false;
    }

    updateButton(i, button, delta) {
        if (Gamepad.BUTTON_ACTIVE_MIN > button.value && this.buttons[i].intensity === 0)
            return false;
        
        const range = Gamepad.BUTTON_ACTIVE_MAX - Gamepad.BUTTON_ACTIVE_MIN,
              intensity = Math.min(1, Math.max(0, button.value - Gamepad.BUTTON_ACTIVE_MIN) / range);

        const data     = new Object();
        data.button    = i;
        data.gamepad   = this;
        data.value     = this.buttons[i].value = button.value;
        data.intensity = intensity;
        data.delta     = delta;
        data.ms        = this.buttons[i].ms += delta;

        if (intensity > 0) {
            if (this.buttons[i].intensity !== 0) {
                if (Gamepad.HOLD_MS > data.ms)
                    return false;
                data.state = 'hold';
                InputManager.dispatch('button-held', data);
            } else {
                this.buttons[i].intensity = intensity;
                this.buttons[i].ms = data.ms = 0;
                data.state = 'press';
                InputManager.dispatch('button-pressed', data);
            }
        } else {
            this.buttons[i].intensity = data.intensity = 0;
            data.state = 'release';
            InputManager.dispatch('button-released', data);
        }

        return data;
    }

    update(state, delta) {
        if (!this.hasUpdate(state))
            return false;
        
        this.timestamp = state.timestamp;
        
        const input     = new Object();
        input.device    = this;
        input.isGamepad = true;
        input.slot      = this.slot;
        input.timestamp = Performance.now();
        input.buttons   = new Array();
        input.axes      = new Array();

        for (let i = 0; i < state.buttons.length; i++) {
            const action = this.updateButton(i, state.buttons[i], delta);
            if (!action)
                continue;
            input.buttons.push(action);
        }

        for (let i = 0; i < state.axes.length; i++) {
            const action = this.updateAxis(i, state.axes[i], delta);
            if (!action)
                continue;
            input.axes.push(action);
        }

        if (!this.connected && input.some(action => action.state === 'press')) {
            return InputManager.dispatch('device-connection-request', input);
        }

        if (input.length !== 0)
            InputManager.dispatch('device-input', input);
    }
}
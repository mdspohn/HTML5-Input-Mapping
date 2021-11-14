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
        this.active = false;
        this.requestingConnection = false;
    }

    hasUpdate(state) {
        if (state === null)
            return false;

        if (state.timestamp > this.timestamp)
            return true;

        if (state.buttons.some(button => button.value > Gamepad.BUTTON_ACTIVE_MIN))
            return true;

        if (state.axes.some(axis => Math.abs(axis) > Gamepad.AXIS_ACTIVE_MIN))
            return true;
    }

    updateAxis(i, axis, delta) {
        if (Gamepad.AXIS_ACTIVE_MIN > Math.abs(axis) && this.axes[i].intensity === 0)
            return null;

        const range = Gamepad.AXIS_ACTIVE_MAX - Gamepad.AXIS_ACTIVE_MIN,
              intensity = Math.sign(axis) * Math.min(1, Math.max(0, Math.abs(axis) - Gamepad.AXIS_ACTIVE_MIN) / range);

        const action     = new Object();
        action.value     = this.axes[i].value = axis;
        action.intensity = this.axes[i].intensity = intensity;
        action.ms        = this.axes[i].ms += delta;

        if (Math.abs(intensity) > 0 && this.axes[i].intensity === 0)
            this.axes[i].ms = action.ms = 0;

        return action;
    }

    updateButton(i, button, delta) {
        if (Gamepad.BUTTON_ACTIVE_MIN > button.value && this.buttons[i].intensity === 0)
            return null;
        
        const range = Gamepad.BUTTON_ACTIVE_MAX - Gamepad.BUTTON_ACTIVE_MIN,
              intensity = Math.min(1, Math.max(0, button.value - Gamepad.BUTTON_ACTIVE_MIN) / range);

        const action     = new Object();
        action.value     = this.buttons[i].value = button.value;
        action.intensity = intensity;
        action.ms        = this.buttons[i].ms += delta;

        if (intensity > 0) {
            if (this.buttons[i].intensity !== 0) {
                if (Gamepad.HOLD_MS > action.ms)
                    return null;
                action.state = 'hold';
            } else {
                this.buttons[i].intensity = intensity;
                this.buttons[i].ms = action.ms = 0;
                action.state = 'press';
            }
        } else {
            this.buttons[i].intensity = action.intensity = 0;
            action.state = 'release';
        }

        return action;
    }

    update(state, delta) {
        if (!this.hasUpdate(state))
            return false;
        
        this.timestamp = state.timestamp;
        
        const data     = new Object();
        data.device    = this;
        data.delta     = delta;
        data.buttons   = new Object();
        data.axes      = new Object();

        let isRequestingConnection = false;

        for (let i = 0; i < state.buttons.length; i++) {
            const action = this.updateButton(i, state.buttons[i], delta);
            if (action === null)
                continue;
            
            data.buttons[i] = action;
            if (action.state === 'press')
                isRequestingConnection = true;
        }

        for (let i = 0; i < state.axes.length; i++) {
            const action = this.updateAxis(i, state.axes[i], delta);
            if (action === null)
                continue;

            data.axes[i] = action;
        }

        if (!this.active && isRequestingConnection) {
            InputManager.dispatch('device-connection-request', data, true);
        } else if (this.active) {
            InputManager.dispatch('device-input', data);
        }
    }
}
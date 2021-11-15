class Gamepad {
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

        if (state.buttons.some(button => button.value > DeviceManager.BUTTON_DRIFT))
            return true;

        if (state.axes.some(axis => Math.abs(axis) > DeviceManager.AXIS_DRIFT))
            return true;
    }

    updateAxis(i, axis, delta) {
        if (DeviceManager.AXIS_DRIFT > Math.abs(axis) && this.axes[i].intensity === 0)
            return null;

        const range = (1 - DeviceManager.AXIS_DRIFT) - DeviceManager.AXIS_DRIFT,
              intensity = Math.sign(axis) * Math.min(1, Math.max(0, Math.abs(axis) - DeviceManager.AXIS_DRIFT) / range);

        const action     = new Object();
        action.value     = this.axes[i].value = axis;
        action.intensity = this.axes[i].intensity = intensity;
        action.ms        = this.axes[i].ms += delta;

        if (Math.abs(intensity) > 0 && this.axes[i].intensity === 0)
            this.axes[i].ms = action.ms = 0;

        return action;
    }

    updateButton(i, button, delta) {
        if (DeviceManager.BUTTON_DRIFT > button.value && this.buttons[i].intensity === 0)
            return null;
        
        const range = (1 - DeviceManager.BUTTON_DRIFT) - DeviceManager.BUTTON_DRIFT,
              intensity = Math.min(1, Math.max(0, button.value - DeviceManager.BUTTON_DRIFT) / range);

        const action     = new Object();
        action.value     = this.buttons[i].value = button.value;
        action.intensity = intensity;
        action.ms        = this.buttons[i].ms += delta;

        if (intensity > 0) {
            if (this.buttons[i].intensity !== 0) {
                if (DeviceManager.HOLD_DELAY > action.ms)
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

        if (this.active) {
            DeviceManager.dispatch('device-input', data);
        } else if (isRequestingConnection) {
            DeviceManager.dispatch('device-connection-request', data, true);
        }
    }
}
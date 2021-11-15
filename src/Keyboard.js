class Keyboard {
    constructor() {
        // Device State
        this.id        = 'Keyboard';
        this.index     = null;
        this.mapping   = null;
        this.keys      = new Object();

        // Connection State
        this.active = false;
        this.requestingConnection = false;

        // Keyboard Events
        document.addEventListener('keydown', (e) => this.updateButton(e.key, true));
        document.addEventListener('keyup', (e) => this.updateButton(e.key, false));

        // prevent keys "sticking" when focus is lost on application
        window.addEventListener('blur', () => Object.entries(this.keys).forEach((button) => this.updateButton(button[0], false)));

        // dispatch detection event for consistency with gamepads
        DeviceManager.dispatch('device-detected', { device: this });
    }

    updateButton(id, pressed) {
        if (!this.keys.hasOwnProperty(id)) {
            if (pressed) {
                this.keys[id] ??= new Object();
                this.keys[id].ms = 0;
            } else return;
        }

        this.keys[id].value = this.keys[id].intensity = +pressed;
    }

    update(delta) {
        const actions = Object.entries(this.keys);
        if (actions.length === 0)
            return;
        
        const data     = new Object();
        data.device    = this;
        data.delta     = delta;
        data.buttons   = new Object();
        data.axes      = new Object();

        let isRequestingConnection = false;
        
        actions.forEach( ([code, state]) => {
            const action = new Object();
            action.value     = state.value;
            action.intensity = state.value;
            action.ms        = state.ms += delta;

            if (action.value > 0) {
                if ((action.ms - delta) === 0) {
                    action.state = 'press';
                } else if (action.ms >= DeviceManager.HOLD_DELAY) {
                    action.state = 'hold';
                }
            } else {
                action.state = 'release';
                delete this.keys[code];
            }

            data.buttons[code] = action;
            if (action.state === 'press')
                isRequestingConnection = true;
        });

        if (this.active) {
            DeviceManager.dispatch('device-input', data);
        } else if (isRequestingConnection) {
            DeviceManager.dispatch('device-connection-request', data, true);
        }
    }
}
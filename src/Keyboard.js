class Keyboard {
    // Minimum amount of time passed (milliseconds) before button-held events are registered
    static HOLD_MS = 500;

    constructor() {
        // Device State
        this.id        = 'Keyboard';
        this.index     = null;
        this.mapping   = null;
        this.keys      = new Object();

        // Connection State
        this.active = false;
        this.requestingConnection = false;

        // Mouse Events
        document.addEventListener('mousemove',   (e) => e);
        document.addEventListener('mouseout',    (e) => {
            Object.values(this.keys).forEach((key) => {
                key.value = 0;
                key.intensity = 0;
            });
        });
        document.addEventListener('click',       (e) => e);
        document.addEventListener('mousedown',   (e) => e);
        document.addEventListener('mouseup',     (e) => e);
        document.addEventListener('contextmenu', (e) => e);
        document.addEventListener('wheel',       (e) => e, { passive: true });

        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] ??= { value: 1, intensity: 1, ms: 0 };
        });
        document.addEventListener('keyup',   (e) => {
            if (!this.keys[e.key])
                return;
            this.keys[e.key].value = 0;
            this.keys[e.key].intensity = 0;
        });
    }

    update(delta) {
        const data     = new Object();
        data.device    = this;
        data.delta     = delta;
        data.buttons   = new Object();
        data.axes      = new Object();

        let canRequestConnection = false,
            active = false;
        
        Object.entries(this.keys).forEach(([code, state]) => {
            const action = new Object();
            action.value     = state.value;
            action.intensity = state.value;
            action.ms        = state.ms += delta;

            if (action.value > 0) {
                if ((action.ms - delta) !== 0) {
                    if (Keyboard.HOLD_MS > action.ms)
                        return null;
                    action.state = 'hold';
                } else {
                    action.state = 'press';
                }
            } else {
                action.state = 'release';
                delete this.keys[code];
            }

            data.buttons[code] = action;
            active = true;
            if (action.state === 'press')
                canRequestConnection = true;
        });

        if (!this.active && canRequestConnection) {
            InputManager.dispatch('device-connection-request', data, true);
        } else if (this.active && active) {
            InputManager.dispatch('device-input', data);
        }
    }
}
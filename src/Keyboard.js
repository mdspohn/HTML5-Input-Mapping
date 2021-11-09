class Keyboard {
    constructor() {
        // Gamepad State
        this.id        = 'Keyboard';
        this.index     = null;
        this.mapping   = null;
        this.keys      = new Object();

        // Connection State
        this.connected = false;
        this.slot      = null;
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
        const input     = new Object();
        input.device    = this;
        input.delta     = delta;
        input.buttons   = new Object();
        input.axes      = new Object();

        let canRequestConnection = false,
            active = false;
        
        Object.entries(this.keys).forEach(([code, data]) => {
            const action = new Object();
            action.value     = data.value;
            action.intensity = data.value;
            action.ms        = data.ms += delta;

            if (action.value > 0) {
                if ((action.ms - delta) !== 0) {
                    if (Gamepad.HOLD_MS > action.ms)
                        return null;
                    action.state = 'hold';
                } else {
                    action.state = 'press';
                }
            } else {
                action.state = 'release';
                delete this.keys[code];
            }

            input.buttons[code] = action;
            active = true;
            if (action.state === 'press')
                canRequestConnection = true;
        });

        if (!this.connected && canRequestConnection) {
            InputManager.dispatch('device-connection-request', input);
        } else if (this.connected && active) {
            InputManager.dispatch('device-input', input);
        }
    }
}
class InputManager {
    static instance = null;

    static dispatch(id, detail) {
        const event = new CustomEvent(id, { detail });
        window.dispatchEvent(event);
    }
    
    constructor() {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Connected Gamepads
        this.gamepads = Array.from(new Array(4), x => new Gamepad());
        this.keyboard = new Keyboard();

        // Mouse Events
        document.addEventListener('mousemove',   (e) => e);
        document.addEventListener('mouseout',    (e) => e);
        document.addEventListener('click',       (e) => e);
        document.addEventListener('mousedown',   (e) => e);
        document.addEventListener('mouseup',     (e) => e);
        document.addEventListener('contextmenu', (e) => e);
        document.addEventListener('wheel',       (e) => e, { passive: true });

        // Keyboard Events
        document.addEventListener('keydown', (e) => e);
        document.addEventListener('keyup',   (e) => e);
        
        // Gamepad Events
        window.addEventListener('gamepadconnected',    (e) => this.gamepads[e.gamepad.index].initialize(e.gamepad));
        window.addEventListener('gamepaddisconnected', (e) => this.gamepads[e.gamepad.index].disconnect());

        // Input Events
        window.addEventListener('button-pressed', (e) => {
            console.log(`Button (#${e.detail.alias}) pressed.`);
        });

        window.addEventListener('button-held', (e) => {
            if (Math.floor(e.detail.ms / 1000) > Math.floor((e.detail.ms - e.detail.delta) / 1000))
                console.warn(`Held for ${Math.floor(e.detail.ms / 1000)} second(s)!`);
        });

        window.addEventListener('button-released', (e) => {
            console.error(`Button (#${e.detail.alias}) released...`);
        });

        window.addEventListener('gamepad-enabled', (e) => {
            console.log(e.detail.gamepad.nid, e.detail.gamepad);
        });

    }

    update(delta) {
        const ngp = navigator.getGamepads();
        this.gamepads.forEach((gamepad, i) => gamepad.update(ngp[i], delta));
    }
}
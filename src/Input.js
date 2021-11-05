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

        // differentiate between n simultaneous devices
        this.currentConnections = 0;
        this.maxConnections = 1;
        // automatically swap first connection to more recently active device not in "this.connection"
        this.autoSwapFirstConnection = true;

        // Connected Players/Devices
        this.gamepads = Array.from(new Array(4), x => new Gamepad());
        this.keyboard = new Keyboard();
        this.connections = new Array(4).fill(null);
        
        // Gamepad Events
        window.addEventListener('gamepadconnected',    (e) => this.gamepads[e.gamepad.index].initialize(e.gamepad));
        window.addEventListener('gamepaddisconnected', (e) => this.gamepads[e.gamepad.index].disconnect());

        window.addEventListener('unconnected-activity', e => {

        });

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
        if (this.currentConnections < this.maxConnections || this.autoSwapFirstConnection) {
            const NGPs = navigator.getGamepads(),
                  connectedGamepads = this.connections.filter(device => device !== null && typeof device === 'Gamepad');

            const idleNGPs = NGPs.filter((NGP, i) => !connectedGamepads.some(gamepad => gamepad.NGPindex === i)),
                  activeNGPs = idleNGPs.filter(NGP => NGP.buttons.some(button => button.value > Gamepad.BUTTON_ACTIVE_MIN));


            if (activeNGPs.length > 0) {
                activeNGPs.sort((a, b) => a.timestamp - b.timestamp);

                if (this.currentConnections < this.maxConnections) {
                    activeNGPs.forEach(NGP => InputManager.dispatch('connection-request', NGP));
                } else {
                    this.connections[0] = new Gamepad(activeNGPs[0]);
                }
            }
        }

        this.connections.forEach(device => device.update(delta));
        const ngp = navigator.getGamepads();
        this.gamepads.forEach((gamepad, i) => gamepad.update(ngp[i], delta));
    }
}
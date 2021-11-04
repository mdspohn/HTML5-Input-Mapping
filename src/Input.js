class InputManager {
    static instance = null;
    
    constructor() {
        if (InputManager.instance !== null)
            return InputManager.instance;
        
        InputManager.instance = this;

        // Input Events
        this.events = new Object();

        // Connected Gamepads
        this.gamepads = new GamepadManager();
        this.keyboard = new KeyboardController();


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
    }

    update(delta) {
        this.gamepads.update(delta);
        //this.keyboard.update(delta);
    }
}
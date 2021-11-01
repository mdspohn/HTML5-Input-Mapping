class Gamepad extends Device {
    constructor() {
        super();
    }

    use(config) {
        this.index = config.index;
        this.buttons = config.buttons;
    }

    update(delta) {
        // TODO
    }

    hasActivity() {
        return typeof this.buttons === 'Array' && this.buttons.some(button => button.pressed || button.value === 1);
    }
}
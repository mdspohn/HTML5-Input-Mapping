class Input {
    static mouse = new MouseInput();
    static keyboard = new KeyboardInput();
    static gamepad = new GamepadInput();

    contructor() {
        Input.mouse.listen('input', () => this.onDeviceFocus(0));
        Input.keyboard.listen('input', () => this.onDeviceFocus(0));
        Input.gamepad.listen('input', () => this.onDeviceFocus(1));
        Input.gamepad.listen('disconnect', () => this.onDeviceFocus(null));
    }
}
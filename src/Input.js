class Input {
    contructor() {
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();
        this.gamepad = new Gamepad();
    }

    update(step) {
        this.mouse.update(step);
        this.keyboard.update(step);
        this.gamepad.update(step);
    }

    onMouseInput(event) {

    }

    onKeyboardInput(event) {

    }

    onGamepadInput(event) {

    }

    onMappedInput(event) {

    }

    listen(identifier, fn, persist = true) {

        //return listener;
    }

    remove(listener) {

    }
}
class Device {
    constructor() {
        this.index = null;
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    update(step) {
        // abstract
    }
}
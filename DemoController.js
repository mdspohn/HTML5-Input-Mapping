class DemoController {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.input = null;

        this.active = document.getElementById('active-device');
        this.keyboard = document.getElementById('slot-keyboard');
        this.gamepads = new Array();
        this.gamepads[0] = document.getElementById('slot-0');
        this.gamepads[1] = document.getElementById('slot-1');
        this.gamepads[2] = document.getElementById('slot-2');
        this.gamepads[3] = document.getElementById('slot-3');

        this.inputEvents = document.getElementById('input-events');

        this.img = new Object();
        this.img.keyboard = new Image();
        this.img.gamepad = new Image();

        this.lastConnectedIndex = null;

        // Event Listeners
        window.addEventListener('device-input', e => {
            // TODO
        });

        window.addEventListener('device-detected', e => {
            const device = e.detail.device;
            if (device.index === null)
                return;
            this.gamepads[e.detail.device.index].className = 'gamepad';
        });

        window.addEventListener('device-connected', e => {
            const index = e.detail.device.index;
            this.changeActive(index);
            this.lastConnectedIndex = index;
            this.inputEvents.classList.toggle('enabled', false);
            setTimeout(() => {
                this.inputEvents.classList.toggle('enabled', true);
            }, 0);
            this.inputEvents.classList.toggle((e.detail.device instanceof Gamepad) ? 'gamepad' : 'keyboard', true);
            this.inputEvents.classList.toggle((e.detail.device instanceof Gamepad) ? 'keyboard' : 'gamepad', false);
        });

        window.addEventListener('device-disconnected', e => {
            this.active.className = '';
            this.inputEvents.classList.toggle('enabled', false);
        });

        window.addEventListener('device-removed', e => {
            const device = e.detail.device;
            if (device.index !== null)
                this.gamepads[device.index].className = '';
        });

    }

    changeActive(slot) {
        [this.keyboard, ...this.gamepads].forEach(device => device.classList.toggle('enabled', false));

        if (slot !== null) {
            this.gamepads[slot].classList.toggle('enabled', true);
        } else {
            this.keyboard.classList.toggle('enabled', true);
        }

        this.active.className = (slot !== null) ? 'gamepad' : 'keyboard';
    }

    update(delta) {
        this.input.update(delta);
    }

    load() {
        const images = new Array();
        images.push(new Promise((resolve => this.img.keyboard.onload = resolve)));
        images.push(new Promise((resolve => this.img.gamepad.onload  = resolve)));

        this.img.keyboard.src = './assets/img/keyboard.png';
        this.img.gamepad.src = './assets/img/gamepad.png';

        return Promise.all(images);
    }

    start() {
        this.input = new DeviceManager();

        let now = performance.now(),
            last;

        const loop = (timestamp) => {
            requestAnimationFrame(loop);
            last = now;
            now = timestamp;
            this.update(now - last);
        }

        requestAnimationFrame(loop);
    }
}
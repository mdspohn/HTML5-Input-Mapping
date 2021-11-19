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
        this.img.ship = new Image();
        this.img.seaFG = new Image();
        this.img.anchor = new Image();
        this.img.smoke = new Image();

        this.lastConnectedIndex = null;

        this.shipX = 0;
        this.shipY = 0;

        this.anchorX = 0;
        this.anchorY = 0;
        this.anchorDirection = 0;
        this.anchorMaxDepth = 300;

        this.cannonEffects = new Array();

        this.resize();

        // Event Listeners
        window.addEventListener('device-input', e => {
            const device = e.detail.device,
                  buttons = e.detail.buttons;
            
            if (device instanceof Gamepad) {
                if (buttons.hasOwnProperty(13) && buttons[13].state === 'press') {
                    this.dropAnchor();
                } else if (buttons.hasOwnProperty(12) && buttons[12].state === 'hold') {
                    this.hoistAnchor();
                } else if (this.anchorDirection === -1) {
                    this.anchorDirection = 0;
                }

                if (buttons.hasOwnProperty(0) && buttons[0].state === 'press')
                    this.fireCannon();
            } else {
                if (buttons.hasOwnProperty('ArrowDown') && buttons['ArrowDown'].state === 'press') {
                    this.dropAnchor();
                } else if (buttons.hasOwnProperty('ArrowUp') && buttons['ArrowUp'].state === 'hold') {
                    this.hoistAnchor();
                } else if (this.anchorDirection === -1) {
                    this.anchorDirection = 0;
                }

                if (buttons.hasOwnProperty(' ') && buttons[' '].state === 'press')
                    this.fireCannon();
            }
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

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('fullscreenchange', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        this.shipX = Math.min(this.canvas.width - 400, this.canvas.width / 2);
        this.shipY = 20;

        this.ms = 0;
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

    renderShip(delta) {
        const yOffset = Math.sin(this.ms / 200);
        this.ctx.drawImage(this.img.ship, 0, 0, this.img.ship.width, this.img.ship.height, this.shipX, this.shipY + yOffset, this.img.ship.width, this.img.ship.height);
    }

    drawRotation(img, x, y, w, h, deg) {
        this.ctx.save();
        this.ctx.translate(x+w/2, y+h/2);
        this.ctx.rotate(deg * Math.PI / 180.0);
        this.ctx.translate(-x-w/2 + (-deg / 4), -y-h/2);
        this.ctx.drawImage(img, x, y, w, h);
        this.ctx.restore();
    }

    renderAnchor(delta) {
        let yOffset = 305 + Math.sin(this.ms / 200),
            degrees = 0;

        if (this.anchorDirection > 0) {
            if (this.anchorY < this.anchorMaxDepth) {
                this.anchorY = Math.min(this.anchorMaxDepth, this.anchorY + (this.anchorMaxDepth * (delta / 1000)));
            } else {
                this.anchorDirection = 0;
            }
        } else if (this.anchorDirection < 0) {
            if (this.anchorY > 0) {
                this.anchorY = Math.max(0, this.anchorY - (this.anchorMaxDepth * (delta / 2000)));
            } else {
                this.anchorDirection = 0;
            }
        }

        degrees = -20 * Math.min(1, this.anchorY / 50);
        degrees *= Math.max(1, 5 * ((this.anchorY - (this.anchorMaxDepth * 0.8)) / (this.anchorMaxDepth * 0.2)));

        this.drawRotation(this.img.anchor, this.shipX + 80 + (this.anchorY / 6), this.shipY + yOffset + this.anchorY, 60, 60, degrees);
        if (this.anchorY > 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.shipX + 120, this.shipY + yOffset + 10);
            this.ctx.lineTo(this.shipX + 120 + Math.max(degrees / 4, -5) + ((degrees + 20) / 80) * 30 + (this.anchorY / 6), this.shipY + yOffset + this.anchorY);
            this.ctx.strokeStyle = '#5a6870';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    renderForeground() {
        this.ctx.drawImage(this.img.seaFG, 0, 0, 300, 10, this.shipX + 50, this.shipY + 352, 300, 10);
    }

    renderCannonFire(delta) {
        const toRemove = new Array();
        this.cannonEffects.forEach((cannonBall, i) => {
            const idx = Math.floor(cannonBall.ms / 40);
            cannonBall.ms += delta;
            if (idx > this.img.smoke.width / 120) {
                toRemove.push(i);
            } else {
                this.ctx.drawImage(this.img.smoke, Math.floor(cannonBall.ms / 40) * 120, 0, 120, 120, this.shipX + 102 + cannonBall.x, this.shipY + 265, 120, 120);
            }
        });
        toRemove.sort((a, b) => a - b);
        toRemove.forEach(i => this.cannonEffects.splice(i, 1));
    }

    update(delta) {
        this.ms += delta;
        this.input.update(delta);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderShip(delta);
        this.renderAnchor(delta);
        this.renderForeground();
        this.renderCannonFire(delta);
    }

    dropAnchor() {
        this.anchorDirection = 1;
    }

    hoistAnchor() {
        this.anchorDirection = -1;
    }

    fireCannon() {
        const cannonBall = new Object();
        cannonBall.ms = 0;
        cannonBall.x = Math.floor(Math.random() * 4) * 38;
        this.cannonEffects.push(cannonBall);
    }

    load() {
        const images = new Array();
        images.push(new Promise((resolve => this.img.keyboard.onload = resolve)));
        images.push(new Promise((resolve => this.img.gamepad.onload  = resolve)));
        images.push(new Promise((resolve => this.img.ship.onload  = resolve)));
        images.push(new Promise((resolve => this.img.seaFG.onload  = resolve)));
        images.push(new Promise((resolve => this.img.anchor.onload  = resolve)));
        images.push(new Promise((resolve => this.img.smoke.onload  = resolve)));

        this.img.keyboard.src = './assets/img/keyboard.png';
        this.img.gamepad.src = './assets/img/gamepad.png';
        this.img.ship.src = './assets/img/ship.png';
        this.img.seaFG.src = './assets/img/sea-foreground.png';
        this.img.anchor.src = './assets/img/anchor.png';
        this.img.smoke.src = './assets/img/smoke-spritesheet.png';

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
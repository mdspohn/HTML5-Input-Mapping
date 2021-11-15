class Slot {
    constructor(index) {
        this.index = index;
        this.device = null;

        this.section = document.getElementById(`player-${this.index}`);
        this.info = this.section.querySelector('.info');
        this.deviceName = this.info.querySelector('p:nth-child(2)');
        this.canvas = this.section.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.onResize();

        // --------------
        this.introMs = 0;
        this.introDurationMs = 500;
        this.balls = new Array();
        this.colors = [
            '#26ccff',
            '#a25afd',
            '#ff5e7e',
            '#88ff5a',
            '#fcff42',
            '#ffa62d',
            '#ff36ff'
          ];
    }

    onResize() {
        const sectionStyles = window.getComputedStyle(this.section);
        this.canvas.style.width = sectionStyles.width;
        this.canvas.style.height = sectionStyles.height;

        this.canvas.width = this.canvas.style.width.slice(0, -2);
        this.canvas.height = this.canvas.style.height.slice(0, -2);
    }

    enable(device, image) {
        this.device = device;
        this.image = image;
        this.section.classList.toggle('enabled', true);
        this.deviceName.innerHTML = device.id;
    }

    disable() {
        this.device = null;
        this.section.classList.toggle('enabled', false);
        this.section.classList.toggle('active', false);
        this.introMs = 0;
        this.balls = new Array();
        this.deviceName.innerHTML = '';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    createBall() {
        const ball = new Object();
        ball.x = Math.round(Math.random() * this.canvas.width);
        ball.y = 0;
        ball.size = Math.round(10 + Math.random() * 10);
        ball.duration = 1000;
        ball.ms = 0;
        //ball.color = Math.floor(Math.random() * 16777215).toString(16);
        ball.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.balls.push(ball);
    }

    update(delta) {
        if (this.device === null)
            return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // intro transition
        if (this.introMs < this.introDurationMs) {
            this.introMs += delta;
            const p = Math.min(1, (this.introMs / this.introDurationMs) * (2 - (this.introMs / this.introDurationMs)));

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.rect(0, 0, this.canvas.width * p, this.canvas.height);
            this.ctx.fill();

            if (this.introMs >= this.introDurationMs)
                this.section.classList.toggle('active', true);
        } else {
            if (this.introMs < this.introDurationMs * 4) {
                this.introMs += delta;
            }
            // draw device icon
            this.ctx.save();
            this.ctx.globalAlpha = Math.min(1, (this.introMs - this.introDurationMs) / (this.introDurationMs * 4));
            this.ctx.drawImage(this.image, (this.canvas.width / 2) - (this.canvas.height / 4), this.canvas.height / 4, this.canvas.height / 2, this.canvas.height / 2);
            this.ctx.restore();

            // draw balls
            this.balls = this.balls.filter(ball => ball.ms < ball.duration);
            this.balls.forEach(ball => {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
                //this.ctx.stroke();
                //this.ctx.fillStyle = '#' + ball.color;
                this.ctx.fillStyle = ball.color;
                this.ctx.fill();
                this.ctx.restore();
                ball.ms += delta;
                ball.y = ((ball.ms / ball.duration) * (ball.ms / ball.duration) * this.canvas.height);
            });
        }

    }
}

class DemoController {
    constructor() {
        this.input = new DeviceManager();

        this.slots = new Array();
        this.slots[0] = new Slot(0);
        this.slots[1] = new Slot(1);
        this.slots[2] = new Slot(2);
        this.slots[3] = new Slot(3);

        this.images = new Object();
        this.images.keyboard = new Image();
        this.images.gamepad = new Image();

        window.addEventListener('resize', () => this.slots.forEach(slot => slot.onResize()));

        window.addEventListener('device-connected', event => {
            const device = event.detail.device;
            this.slots[0].enable(device, ((device instanceof Gamepad) ? this.images.gamepad : this.images.keyboard));
        });

        window.addEventListener('device-disconnected', event => {
            this.slots[0].disable();
        });

        window.addEventListener('device-input', event => {
            if (Object.values(event.detail.buttons).some(button => button.state === 'press')) {
                this.slots[0].createBall();
            }
        });
    }

    update(delta) {
        this.input.update(delta);
        this.slots.forEach(slot => slot.update(delta));
    }

    load() {
        const images = new Array();
        images.push(new Promise((resolve => this.images.keyboard.onload = resolve)));
        images.push(new Promise((resolve => this.images.gamepad.onload  = resolve)));

        this.images.keyboard.src = './assets/img/keyboard.png';
        this.images.gamepad.src = './assets/img/gamepad.png';

        return Promise.all(images);
    }

    start() {
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
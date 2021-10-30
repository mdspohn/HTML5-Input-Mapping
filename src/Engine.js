class EngineLoop {
    static instance = null;

    constructor() {
        if (Engine.instance !== null)
            return Engine.instance;

        Engine.instance = this;

        this.step = (1000 / 20);
        this.running = false;

        this.frame = 0;
        this.now   = 0;
        this.last  = 0;
        this.delta = 0;
    }

    // called based on engine step (UPS)
    update(step) {
        // TODO
    }

    // called based on monitor refresh rate (FPS)
    render(delta) {
        // TODO
    }

    loop(timestamp) {
        this.frame = requestAnimationFrame(this.loop);
        
        this.last = this.now;
        this.now = timestamp;
        this.delta = this.delta + (this.now - this.last);

        while (this.delta >= this.step) {
            this.delta -= this.step;
            this.update(this.step);
        }

        this.render(this.now - this.last);
    }

    start() {
        if (this.running === true)
            return;
        
        this.running = true;
        this.now = performance.now();
        this.delta = this.step;
        this.frame = requestAnimationFrame(this.loop);
    }

    stop() {
        cancelAnimationFrame(this.frame);
        this.running = false;
    }
}
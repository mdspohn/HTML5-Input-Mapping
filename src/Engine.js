class EngineLoop {
    static instance = null;

    constructor() {
        if (EngineLoop.instance !== null)
            return Engine.instance;

            EngineLoop.instance = this;

        this.step = (1000 / 20);
        this.running = false;

        this.frame = 0;
        this.now   = 0;
        this.last  = 0;
        this.delta = 0;
    }

    // called based on engine step (UPS)
    update(step) {
        Input.update(step);
    }

    // called based on monitor refresh rate (FPS)
    render(delta) {
        // TODO
    }

    start() {
        if (this.running === true)
            return;
        
        this.running = true;
        this.now = performance.now();
        this.delta = this.step;

        const loop = (timestamp) => {
            this.frame = requestAnimationFrame(loop);
            
            this.last = this.now;
            this.now = timestamp;
            this.delta = this.delta + (this.now - this.last);

            while (this.delta >= this.step) {
                this.delta -= this.step;
                this.update(this.step);
            }

            this.render(this.now - this.last);
        }

        this.frame = requestAnimationFrame(loop);
    }

    stop() {
        cancelAnimationFrame(this.frame);
        this.running = false;
    }
}
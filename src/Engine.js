class EngineLoop {
    static instance = null;

    constructor() {
        if (EngineLoop.instance !== null)
            return EngineLoop.instance;

        this.step = (1000 / 20);
        this.frame = 0;
        this.running = false;

        EngineLoop.instance = this;
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
        
        let last,
            now = performance.now(),
            delta = this.step;

        const loop = (timestamp) => {
            this.frame = requestAnimationFrame(loop);
            
            last = now;
            now = timestamp;
            delta = delta + (now - last);

            while (delta >= this.step) {
                delta -= this.step;
                this.update(this.step);
            }

            this.render(now - last);
        }

        this.frame = requestAnimationFrame(loop);
    }

    stop() {
        cancelAnimationFrame(this.frame);
        this.running = false;
    }
}
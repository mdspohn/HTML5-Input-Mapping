class Keyboard {
    constructor() {
        // Mouse Events
        document.addEventListener('mousemove',   (e) => e);
        document.addEventListener('mouseout',    (e) => e);
        document.addEventListener('click',       (e) => e);
        document.addEventListener('mousedown',   (e) => e);
        document.addEventListener('mouseup',     (e) => e);
        document.addEventListener('contextmenu', (e) => e);
        document.addEventListener('wheel',       (e) => e, { passive: true });

        // Keyboard Events
        document.addEventListener('keydown', (e) => e);
        document.addEventListener('keyup',   (e) => e);
    }

    getChanges(delta) {
        const changes = new Array();
        // TODO
        return changes;
    }
}
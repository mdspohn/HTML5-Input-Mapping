class EventManager {
    static instance = null;

    constructor() {
        if (EventManager.instance !== null)
            return EventManager.instance;

        EventManager.instance = this;
        
        // Registered Event Listeners
        this.listeners = new Object();
    }

    dispatch(name, detail) {
        if (this.listeners.hasOwnProperty[name] === undefined)
            return;

        for (let [id, listener] of Object.entries(this.listeners[name])) {
            listener.callback(id, detail);

            if (listener.persistent !== true)
                this.remove(name, id);
        }
    }

    listen(name, callback, persistent = false) {
        this.listeners[name] = this.listeners[name] || new Object();
        
        // generate UID, repeat on overlap
        const id = Math.random().toString(36).substr(2, 9);
        if (this.listeners[name][id] !== undefined)
            return this.listen(name, callback, persistent);

        this.listeners[name][id] = { callback, persistent };
        return id;
    }

    remove(name, id) {
        if (this.listeners[name]?.[id] !== undefined)
            delete this.listeners[name][id];
    }
}
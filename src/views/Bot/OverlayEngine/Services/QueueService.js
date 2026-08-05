class QueueService {
    constructor() {
        this.queue = [];
        this.currentItem = null;

        this.onQueueChanged = null;
        this.onCurrentItemChanged = null;
    }

    add(item) {
        if (!item) return;

        this.queue.push(item);

        this.notifyQueueChanged();

        if (!this.currentItem) {
            this.processNext();
        }
    }

    processNext() {
        if (this.currentItem) {
            return;
        }

        if (!this.queue.length) {
            return;
        }

        this.currentItem = this.queue.shift();

        this.notifyQueueChanged();
        this.notifyCurrentItemChanged();
    }

    completeCurrent() {
        this.currentItem = null;

        this.notifyCurrentItemChanged();

        this.processNext();
    }

    clear() {
        this.queue = [];
        this.currentItem = null;

        this.notifyQueueChanged();
        this.notifyCurrentItemChanged();
    }

    getCurrent() {
        return this.currentItem;
    }

    getQueue() {
        return [...this.queue];
    }

    getQueueLength() {
        return this.queue.length;
    }

    isBusy() {
        return this.currentItem !== null;
    }

    setQueueChangedCallback(callback) {
        this.onQueueChanged = callback;
    }

    setCurrentItemChangedCallback(callback) {
        this.onCurrentItemChanged = callback;
    }

    notifyQueueChanged() {
        if (typeof this.onQueueChanged === "function") {
            this.onQueueChanged(this.getQueue());
        }
    }

    notifyCurrentItemChanged() {
        if (typeof this.onCurrentItemChanged === "function") {
            this.onCurrentItemChanged(this.currentItem);
        }
    }
}

export default new QueueService();
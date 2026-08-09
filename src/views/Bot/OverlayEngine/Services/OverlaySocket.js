class OverlaySocket {
    constructor() {
        this.socket = null;
        this.reconnectTimer = null;
        this.shouldReconnect = true;

        this.callbacks = {
            connected: null,
            disconnected: null,
            message: null,
            error: null
        };
    }

    connect({
        broadcasterId,
        onConnected,
        onDisconnected,
        onMessage,
        onError
    }) {
        this.disconnect();

        this.shouldReconnect = true;

        this.callbacks.connected = onConnected;
        this.callbacks.disconnected = onDisconnected;
        this.callbacks.message = onMessage;
        this.callbacks.error = onError;

        if (!broadcasterId) {
            console.warn("OverlaySocket: Missing broadcasterId");
            return;
        }

        const params = new URLSearchParams({
            broadcasterId
        });

        const wsUrl = `ws://localhost:3000/events-ws?${params.toString()}`;

        console.log("OverlaySocket connecting:", wsUrl);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("OverlaySocket connected");

            if (this.callbacks.connected) {
                this.callbacks.connected();
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                if (this.callbacks.message) {
                    this.callbacks.message(payload);
                }

            } catch (error) {
                console.error("OverlaySocket invalid payload", error);

                if (this.callbacks.error) {
                    this.callbacks.error(error);
                }
            }
        };

        this.socket.onerror = (error) => {
            console.error("OverlaySocket error", error);

            if (this.callbacks.error) {
                this.callbacks.error(error);
            }
        };

        this.socket.onclose = (event) => {

            console.log("OverlaySocket disconnected", event.code);

            if (this.callbacks.disconnected) {
                this.callbacks.disconnected(event);
            }

            if (!this.shouldReconnect) {
                return;
            }

            clearTimeout(this.reconnectTimer);

            this.reconnectTimer = setTimeout(() => {
                this.connect({
                    broadcasterId,
                    onConnected,
                    onDisconnected,
                    onMessage,
                    onError
                });
            }, 3000);
        };
    }

    disconnect() {

        this.shouldReconnect = false;

        clearTimeout(this.reconnectTimer);

        if (!this.socket) {
            return;
        }

        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;

        this.socket.close();
        this.socket = null;
    }
}

export default new OverlaySocket();
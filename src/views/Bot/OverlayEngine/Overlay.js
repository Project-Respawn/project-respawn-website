// src/views/Bot/OverlayEngine/Overlay.js

import AlertCard from "./Widgets/AlertWidget/AlertCard.vue";

import OverlaySocket from "./Services/OverlaySocket.js";
import OverlayEventFactory from "./Services/OverlayEventFactory.js";
import QueueService from "./Services/QueueService.js";

export default {
    name: "Overlay",

    components: {
        AlertCard
    },

    data() {
        return {
            broadcasterId: "",
            socketConnected: false,
            currentEvent: null,
            showDebug: true
        };
    },

    mounted() {

        this.broadcasterId = this.$route.query.broadcasterId || "";
        this.showDebug = this.$route.query.debug !== "false";

        OverlaySocket.connect({

            broadcasterId: this.broadcasterId,

            onConnected: () => {

                console.log("Overlay connected");
                this.socketConnected = true;

            },

            onDisconnected: () => {

                console.log("Overlay disconnected");
                this.socketConnected = false;

            },

            onMessage: (payload) => {

                console.log("Overlay received payload", payload);

                const overlayEvent = OverlayEventFactory.create(payload);

                if (!overlayEvent) {
                    return;
                }

                QueueService.add(overlayEvent);

            },

            onError: (error) => {

                console.error("Overlay socket error", error);

            }

        });

        QueueService.onNext((event) => {

            console.log("Displaying overlay event", event);

            this.currentEvent = event;

        });

        QueueService.onFinished(() => {

            console.log("Overlay event finished");

            this.currentEvent = null;

        });

    },

    beforeUnmount() {

        OverlaySocket.disconnect();

    }

};
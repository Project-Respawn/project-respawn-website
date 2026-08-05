class OverlayEventFactory {

    create(rawEvent) {

        if (!rawEvent) {
            return null;
        }

        if (rawEvent.type !== "overlay-event") {
            return null;
        }

        switch (rawEvent.eventType) {

            case "tts":
                return this.createTts(rawEvent.payload);

            default:
                console.warn(
                    `OverlayEventFactory: Unknown event type "${rawEvent.eventType}"`
                );

                return null;
        }
    }

    createTts(payload = {}) {

        const username = String(
            payload.username || "Anonymous"
        ).trim();

        const text = String(
            payload.text || ""
        ).trim();

        if (!text) {
            return null;
        }

        return {

            type: "tts",

            widget: "AlertCard",

            title: username,

            message: text,

            icon: "💬",

            duration: 5000,

            payload
        };
    }

}

export default new OverlayEventFactory();
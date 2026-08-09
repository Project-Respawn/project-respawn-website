// src/router/overlay.routes.js

import Overlay from '../views/Bot/OverlayEngine/Overlay.vue';

export default [
    {
        path: '/tts-overlay',
        name: 'OverlayEngine',
        component: Overlay,
        meta: {
            hideLayout: true
        }
    },
    {
        path: '/overlay',
        name: 'Overlay',
        component: Overlay,
        meta: {
            hideLayout: true
        }
    }
];
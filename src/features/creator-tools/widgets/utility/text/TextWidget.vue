<template><div class="demo-widget text-widget" :style="widgetStyle(widget.settings)">{{ widget.settings.text }}</div></template>
<script setup>import { widgetStyle } from '../../widgetHelpers.js'; defineProps({ widget: { type:Object, required:true } })</script>

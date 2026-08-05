<template>
    <div class="alert-card">

        <div
            v-if="alert.icon"
            class="alert-icon"
        >
            {{ alert.icon }}
        </div>

        <div class="alert-content">

            <div
                v-if="alert.title"
                class="alert-title"
            >
                {{ alert.title }}
            </div>

            <div
                v-if="alert.message"
                class="alert-message"
            >
                {{ alert.message }}
            </div>

        </div>

    </div>
</template>

<script src="./AlertCard.js"></script>

<style scoped src="./AlertCard.css"></style>
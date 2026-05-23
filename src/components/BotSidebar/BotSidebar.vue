<template>
  <div class="bot-sidebar">
    <h2>Bot Settings</h2>
    <ul>
      <li><router-link to="/bot/twitch">Twitch Bot</router-link></li>
      <li><router-link to="/bot/discord">Discord Bot</router-link></li>
      <li><router-link to="/bot/automation">Automation</router-link></li>
      <li><router-link to="/bot/settings">General Settings</router-link></li>
    </ul>
  </div>
</template>

<script setup></script>

<style scoped src="./BotSidebar.css"></style>
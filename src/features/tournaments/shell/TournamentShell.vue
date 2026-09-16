<template>
  <section class="tournament-experience">
    <div v-if="!tournament" class="tournament-not-found"><h1>Tournament not found</h1><RouterLink to="/tournaments">View tournaments</RouterLink></div>
    <template v-else>
      <header class="tournament-top"><RouterLink to="/esports">⟳ PROJECT RESPAWN</RouterLink><span>FRONTEND PREVIEW · SAMPLE DATA</span><button @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-controls="tournament-navigation">☰ Navigation</button></header>
      <div class="tournament-frame"><aside :class="{open:menuOpen}"><div class="event-label"><small>{{ tournament.edition }}</small><h2>{{ tournament.name }}</h2><p>{{ tournament.game }} · {{ tournament.server }}</p></div>
        <nav id="tournament-navigation" aria-label="Tournament sections"><RouterLink v-for="item in navigation" :key="item.key" :to="path(item.segment)" :class="{active:active===item.key}" :aria-current="active===item.key?'page':undefined" @click="menuOpen=false"><span>{{ item.label }}</span></RouterLink></nav>
        <p class="shell-note">One tournament. Every angle.<br>Permanent tournament navigation.</p></aside>
        <div class="tournament-main"><p class="preview-notice">Interactive frontend preview. Teams, scores and live states are illustrative. Registration, broadcasts and results are not connected.</p><RouterView :key="$route.fullPath"/><footer>PROJECT RESPAWN · {{ tournament.name }}<br>Sample fixtures and players are not confirmed tournament entries.</footer></div>
      </div>
    </template>
  </section>
</template>
<script src="./TournamentShell.js"></script>
<style src="./TournamentShell.css"></style>

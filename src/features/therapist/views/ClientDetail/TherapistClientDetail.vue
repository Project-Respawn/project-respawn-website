<script src="./TherapistClientDetail.js"></script>

<template>
  <section v-if="client" class="therapist-client-workspace">
    <TherapistClientPanel :client="client" :clients="clients" :stats="questStats" @switch-client="switchClient" @assign="goToAssignQuest" @overview="activeTab = 'overview'" @request-access="requestAccess" />
    <div class="client-workspace-main">
      <header class="workspace-header">
        <div><span>Client Workspace</span><h1>{{ activeTabLabel }}</h1></div>
        <div><button type="button" @click="demoNotice('Messaging')">☵&nbsp; Message client</button><button type="button" @click="demoNotice('More actions')">•••&nbsp; More actions</button></div>
      </header>
      <TherapistClientWorkspaceNav v-model="activeTab" />
      <template v-if="activeTab === 'quests'">
        <section class="quest-summary-row">
          <article><i class="green">✓</i><span>Active quests<strong>{{ questStats.active }}</strong><small>Needs attention</small></span></article>
          <article><i class="blue">✓</i><span>Completed this week<strong>{{ questStats.completed }}</strong><small>+{{ questStats.completedPoints }} RP earned</small></span></article>
          <article><i class="orange">!</i><span>Overdue<strong>{{ questStats.overdue }}</strong><small>Needs review</small></span></article>
          <article><i class="purple">☆</i><span>Total points earned<strong>{{ questStats.totalPoints.toLocaleString() }}</strong><small>All time</small></span></article>
          <div class="quest-header-actions"><button type="button" @click="goToAssignQuest">＋&nbsp; Assign Quest</button><button type="button" @click="demoNotice('Quest templates')">▣&nbsp; Browse Templates</button></div>
        </section>
        <section class="quest-master-detail">
          <TherapistClientQuestList :quests="clientQuests" :selected-id="selectedQuestId" @select="selectedQuestId = $event" />
          <TherapistClientQuestDetail :quest="selectedQuest" @action="handleQuestAction" />
        </section>
      </template>
      <TherapistClientOverview v-else-if="activeTab === 'overview'" :client="client" :quests="clientQuests" @open-quests="activeTab = 'quests'" @open-sharing="activeTab = 'sharing'" />
      <section v-else class="workspace-placeholder">
        <h2>{{ activeTabLabel }}</h2><p>This client workspace section is currently being built.</p>
        <button v-if="activeTab === 'sharing'" type="button" @click="requestAccess">Request additional access</button>
      </section>
    </div>
  </section>
  <section v-else class="client-detail-not-found"><h1>Client not found</h1><RouterLink to="/therapist/clients">Return to clients</RouterLink></section>
</template>

<style src="./TherapistClientDetail.css"></style>

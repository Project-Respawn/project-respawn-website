<template>
  <div class="forum-layout-shell">
    <!-- Forum Layout Sidebar -->
    <aside class="forum-layout-sidebar">
      <div class="forum-layout-sidebar-inner">
        <div class="forum-layout-brand">
          <p class="forum-layout-brand-kicker">Project Respawn</p>
          <h1 class="forum-layout-brand-title">Forums</h1>
          <p class="forum-layout-brand-copy">
            Browse sections, follow active discussions, and jump between boards without leaving the forum flow.
          </p>
        </div>

        <nav class="forum-layout-nav">
          <div
            v-for="category in forumSections"
            :key="category.id"
            class="forum-layout-nav-group"
          >
            <p class="forum-layout-nav-heading">{{ category.name }}</p>

            <button
              v-for="board in category.boards"
              :key="board.id"
              class="forum-layout-nav-link"
              :class="{ 'is-active': isBoardActive(board.id) }"
              @click="goToBoard(board.id)"
            >
              <span class="forum-layout-nav-link-icon">{{ board.icon }}</span>
              <span class="forum-layout-nav-link-label">{{ board.name }}</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Main Content Column -->
    <div class="forum-layout-main-column">
      <header class="forum-layout-topbar">
        <div class="forum-layout-topbar-copy">
          <p class="forum-layout-topbar-kicker">Community Hub</p>
          <h2 class="forum-layout-topbar-title">{{ currentPageTitle }}</h2>
        </div>

        <div class="forum-layout-topbar-actions">
          <button class="forum-layout-primary-btn" @click="goToForumHome">
            Forum Home
          </button>
          <button class="forum-layout-secondary-btn">
            New Thread
          </button>
        </div>
      </header>

      <main class="forum-layout-content">
        <router-view />
      </main>
    </div>

    <!-- Right Sidebar Widgets -->
    <aside class="forum-layout-rightbar">
      <div class="forum-layout-rightbar-card">
        <div class="forum-layout-card-header">
          <div>
            <p class="forum-layout-card-kicker">Recent Activity</p>
            <h3 class="forum-layout-card-title">Your Posts & Replies</h3>
          </div>
        </div>

        <div class="forum-layout-activity-list">
          <article
            v-for="item in recentActivity"
            :key="item.id"
            class="forum-layout-activity-item"
          >
            <div class="forum-layout-activity-icon">
              <span>{{ item.icon }}</span>
            </div>

            <div class="forum-layout-activity-copy">
              <p class="forum-layout-activity-title">{{ item.title }}</p>
              <p class="forum-layout-activity-meta">
                {{ item.board }} · {{ item.time }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <div class="forum-layout-rightbar-card">
        <div class="forum-layout-card-header">
          <div>
            <p class="forum-layout-card-kicker">Community</p>
            <h3 class="forum-layout-card-title">Friends Online</h3>
          </div>
        </div>

        <div class="forum-layout-friends-list">
          <article
            v-for="friend in friendsOnline"
            :key="friend.id"
            class="forum-layout-friend-item"
          >
            <div class="forum-layout-friend-avatar">
              {{ friend.initials }}
              <span class="forum-layout-friend-status"></span>
            </div>

            <div class="forum-layout-friend-copy">
              <p class="forum-layout-friend-name">{{ friend.name }}</p>
              <p class="forum-layout-friend-meta">{{ friend.status }}</p>
            </div>
          </article>
        </div>
      </div>
    </aside>
  </div>
</template>

<script src="./ForumLayout.js"></script>
<style src="./ForumLayout.css"></style>
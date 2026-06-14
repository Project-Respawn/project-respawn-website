<template>
  <section class="admin-home-page">
    <header class="admin-home-hero">
      <div class="admin-home-hero-copy">
        <p class="admin-home-kicker">Project Respawn</p>
        <h1 class="admin-home-title">Admin Dashboard</h1>
        <p class="admin-home-description">
          Manage staff tools, permissions, forum structure, merch systems, and operational access from one central control hub.
        </p>
      </div>

      <div class="admin-home-hero-actions">
        <button
          type="button"
          class="admin-home-btn admin-home-btn-primary"
          @click="goToRoute('/dashboard/forums')"
        >
          Manage Forums
        </button>
        <button
          type="button"
          class="admin-home-btn admin-home-btn-secondary"
          @click="goToRoute('/dashboard/permissions')"
        >
          Review Permissions
        </button>
      </div>
    </header>

    <section class="admin-home-overview-grid">
      <article class="admin-home-overview-card">
        <p class="admin-home-card-kicker">Structure</p>
        <h2 class="admin-home-card-title">Control Centre</h2>
        <p class="admin-home-card-copy">
          Use this dashboard to manage the systems your team needs without editing core site code each time something changes.
        </p>
      </article>

      <article class="admin-home-overview-card">
        <p class="admin-home-card-kicker">Scalable</p>
        <h2 class="admin-home-card-title">Built to Grow</h2>
        <p class="admin-home-card-copy">
          As new tools are added, this hub gives staff a clear place to enter each section instead of relying only on the sidebar.
        </p>
      </article>

      <article class="admin-home-overview-card">
        <p class="admin-home-card-kicker">Access</p>
        <h2 class="admin-home-card-title">Role Aware</h2>
        <p class="admin-home-card-copy">
          Keep permissions, structure, and admin workflows organised as Project Respawn expands.
        </p>
      </article>
    </section>

    <section class="admin-home-section">
      <div class="admin-home-section-header">
        <div>
          <p class="admin-home-section-kicker">Navigation</p>
          <h2 class="admin-home-section-title">Admin Sections</h2>
        </div>
      </div>

      <div class="admin-home-cards-grid">
        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/users')"
        >
          <span class="admin-home-link-icon">👥</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Users</h3>
            <p class="admin-home-link-text">
              Review user access, staff visibility, and account management tools.
            </p>
          </div>
        </button>

        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/permissions')"
        >
          <span class="admin-home-link-icon">🛡️</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Permissions</h3>
            <p class="admin-home-link-text">
              Control role-based access across admin, forum, bot, and wider platform systems.
            </p>
          </div>
        </button>

        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/forums')"
        >
          <span class="admin-home-link-icon">🧵</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Forums</h3>
            <p class="admin-home-link-text">
              Create and manage categories, boards, naming, ordering, and forum growth over time.
            </p>
          </div>
        </button>

        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/brands')"
        >
          <span class="admin-home-link-icon">🏷️</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Brands</h3>
            <p class="admin-home-link-text">
              Maintain brand records used across merch and partner management tools.
            </p>
          </div>
        </button>

        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/merch-categories')"
        >
          <span class="admin-home-link-icon">📦</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Merch Categories</h3>
            <p class="admin-home-link-text">
              Organise storefront categories so products remain easy to sort and manage.
            </p>
          </div>
        </button>

        <button
          type="button"
          class="admin-home-link-card"
          @click="goToRoute('/dashboard/brand-permissions')"
        >
          <span class="admin-home-link-icon">🔐</span>
          <div class="admin-home-link-copy">
            <h3 class="admin-home-link-title">Brand Permissions</h3>
            <p class="admin-home-link-text">
              Assign access so staff and approved users only manage the brands they should control.
            </p>
          </div>
        </button>
      </div>
    </section>
  </section>
</template>

<script src="./AdminHome.js"></script>
<style src="./AdminHome.css"></style>
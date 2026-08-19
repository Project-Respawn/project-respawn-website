<script setup>
// ============================================================
// PROJECT RESPAWN — PARTNER DASHBOARD
// ============================================================

import PartnerSidebar from '../../components/PartnerSidebar.vue';
import PartnerHeader from '../../components/PartnerHeader.vue';
import PartnerStatCard from '../../components/PartnerStatCard.vue';
import PartnerCampaignCard from '../../components/PartnerCampaignCard.vue';

import {
  partner,
  partnershipStatus,
  partnerStats,
  campaigns,
  featuredPlacement,
  recentPerformance,
  quickActions,
  opportunities,
} from '../../data/partnerDemoData.js';

import '../../styles/partner-hub.css';
</script>

<template>
  <div class="partner-hub">
    <PartnerSidebar />

    <main class="partner-dashboard">
      <!-- ================================================== -->
      <!-- SECTION 1 — PARTNER HEADER                         -->
      <!-- ================================================== -->

      <PartnerHeader :partner="partner" />

      <!-- ================================================== -->
      <!-- SECTION 2 + SECTION 5                              -->
      <!-- PARTNERSHIP STATUS + FEATURED PLACEMENT             -->
      <!-- ================================================== -->

      <div class="partner-dashboard-two-column">
        <section class="partner-panel">
          <div class="partner-panel-header">
            <h2>♧ Partnership Status</h2>

            <span class="partner-active-badge">
              ✦ {{ partnershipStatus.status }}
            </span>
          </div>

          <div class="partner-status-grid">
            <div class="partner-status-item">
              <span>Plan</span>
              <strong>
                {{ partnershipStatus.plan }}
              </strong>
            </div>

            <div class="partner-status-item">
              <span>Featured until</span>
              <strong class="partner-highlight">
                {{ partnershipStatus.featuredUntil }}
              </strong>
            </div>

            <div class="partner-status-item">
              <span>Partner since</span>
              <strong>
                {{ partnershipStatus.partnerSince }}
              </strong>
            </div>

            <div class="partner-status-item">
              <span>Your partner manager</span>

              <div class="partner-manager-inline">
                <div class="partner-manager-avatar">
                  {{ partnershipStatus.manager.initials }}
                </div>

                <div>
                  <strong>
                    {{ partnershipStatus.manager.name }}
                  </strong>

                  <small>
                    {{ partnershipStatus.manager.role }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 5 — FEATURED PLACEMENT -->

        <section class="partner-panel">
          <div class="partner-panel-header">
            <h2>☆ Featured Placement</h2>

            <span class="partner-active-badge">
              ✦ Active
            </span>
          </div>

          <div class="partner-featured-content">
            <div class="partner-featured-message">
              <div class="partner-featured-icon">
                ♛
              </div>

              <p>
                Your brand is currently featured on Project Respawn.
              </p>
            </div>

            <div class="partner-featured-metrics">
              <div>
                <strong>
                  {{ featuredPlacement.impressions }}
                </strong>

                <span>Impressions</span>
              </div>

              <div>
                <strong>
                  {{ featuredPlacement.profileVisits }}
                </strong>

                <span>Profile visits</span>
              </div>

              <div>
                <strong>
                  {{ featuredPlacement.clickRate }}
                </strong>

                <span>Click through rate</span>
              </div>
            </div>
          </div>

          <RouterLink
            to="/partners"
            class="partner-small-outline-button"
          >
            View public page ↗
          </RouterLink>
        </section>
      </div>

      <!-- ================================================== -->
      <!-- SECTION 3 — KEY PERFORMANCE STATS                   -->
      <!-- ================================================== -->

      <section class="partner-stat-grid">
        <PartnerStatCard
          v-for="stat in partnerStats"
          :key="stat.id"
          :stat="stat"
        />
      </section>

      <!-- ================================================== -->
      <!-- SECTION 4 + SECTION 6 + SECTION 7                  -->
      <!-- ================================================== -->

      <div class="partner-dashboard-main-grid">
        <!-- SECTION 4 — ACTIVE CAMPAIGNS -->

        <section class="partner-panel">
          <div class="partner-panel-header">
            <h2>♙ Active Campaigns</h2>

            <RouterLink
              to="/partner/campaigns"
              class="partner-link"
            >
              View all campaigns
            </RouterLink>
          </div>

          <div class="partner-campaign-list">
            <PartnerCampaignCard
              v-for="campaign in campaigns"
              :key="campaign.id"
              :campaign="campaign"
            />
          </div>
        </section>

        <!-- SECTION 6 — RECENT PERFORMANCE -->

        <section class="partner-panel partner-performance-panel">
          <div class="partner-panel-header">
            <h2>Recent Performance</h2>

            <select class="partner-period-select">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
            </select>
          </div>

          <span class="partner-performance-title">
            {{ recentPerformance.title }}
          </span>

          <strong class="partner-positive">
            ↑ {{ recentPerformance.change }}
            {{ recentPerformance.period }}
          </strong>

          <div class="partner-chart-wrapper">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              class="partner-performance-chart"
            >
              <polyline
                :points="
                  recentPerformance.points
                    .map(([x, y]) => `${x},${y}`)
                    .join(' ')
                "
                fill="none"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div class="partner-chart-labels">
            <span>Aug 24</span>
            <span>Aug 31</span>
            <span>Sep 7</span>
            <span>Sep 14</span>
            <span>Sep 21</span>
          </div>
        </section>

        <!-- SECTION 7 — QUICK ACTIONS -->

        <section class="partner-panel">
          <div class="partner-panel-header">
            <h2>ϟ Quick Actions</h2>
          </div>

          <div class="partner-quick-actions">
            <RouterLink
              v-for="action in quickActions"
              :key="action.label"
              :to="action.route"
              class="partner-quick-action"
            >
              <span>
                {{ action.label }}
              </span>

              <span>›</span>
            </RouterLink>

            <RouterLink
              to="/partner/campaigns"
              class="partner-primary-action"
            >
              <span>Create campaign</span>
              <span>＋</span>
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- ================================================== -->
      <!-- SECTION 8 — UPCOMING OPPORTUNITIES                 -->
      <!-- ================================================== -->

      <section class="partner-panel partner-opportunities-panel">
        <div class="partner-panel-header">
          <h2>♙ Upcoming Opportunities</h2>

          <button class="partner-link partner-link-button">
            View all opportunities ›
          </button>
        </div>

        <div class="partner-opportunity-grid">
          <article
            v-for="opportunity in opportunities"
            :key="opportunity.id"
            class="partner-opportunity-card"
          >
            <div class="partner-opportunity-icon">
              {{ opportunity.icon }}
            </div>

            <div class="partner-opportunity-content">
              <strong>
                {{ opportunity.title }}
              </strong>

              <span>
                {{ opportunity.description }}
              </span>

              <small>
                {{ opportunity.meta }}
              </small>
            </div>

            <button class="partner-small-outline-button">
              {{ opportunity.action }}
            </button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
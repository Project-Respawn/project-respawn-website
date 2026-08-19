<script setup>
import { computed, ref } from 'vue';

import PartnerSidebar from '../../components/PartnerSidebar.vue';

import '../../styles/partner-hub.css';
import '../../styles/partner-analytics.css';

// ============================================================
// PROJECT RESPAWN — PARTNER ANALYTICS DEMO
// ============================================================


// ============================================================
// SECTION 1 — FILTER STATE
// ============================================================

const selectedPeriod = ref('30');
const selectedCampaign = ref('all');


// ============================================================
// SECTION 2 — HEADLINE METRICS
// ============================================================

const headlineMetrics = [
  {
    id: 'reach',
    label: 'Total Reach',
    value: '84,240',
    change: '+18.7%',
    icon: '◎',
    tone: 'purple',
  },
  {
    id: 'engagements',
    label: 'Engagements',
    value: '12,480',
    change: '+22.4%',
    icon: '♡',
    tone: 'blue',
  },
  {
    id: 'conversations',
    label: 'Brand Conversations',
    value: '3,842',
    change: '+31.2%',
    icon: '◌',
    tone: 'green',
  },
  {
    id: 'conversions',
    label: 'Conversions',
    value: '1,126',
    change: '+15.3%',
    icon: '▱',
    tone: 'gold',
  },
  {
    id: 'conversion-rate',
    label: 'Conversion Rate',
    value: '3.4%',
    change: '+9.6%',
    icon: '◉',
    tone: 'pink',
  },
];


// ============================================================
// SECTION 3 — ENGAGEMENT FUNNEL
// ============================================================

const funnel = [
  {
    label: 'Reached',
    value: '84,240',
    percentage: '100%',
    width: 100,
    tone: 'purple',
  },
  {
    label: 'Engaged',
    value: '12,480',
    percentage: '14.8%',
    width: 72,
    tone: 'blue',
  },
  {
    label: 'Brand Conversations',
    value: '3,842',
    percentage: '4.6%',
    width: 57,
    tone: 'green',
  },
  {
    label: 'Showed Intent',
    value: '2,160',
    percentage: '2.6%',
    width: 47,
    tone: 'gold',
  },
  {
    label: 'Converted',
    value: '1,126',
    percentage: '1.3%',
    width: 38,
    tone: 'pink',
  },
];


// ============================================================
// SECTION 4 — CREATOR PERFORMANCE
// ============================================================

const creatorPerformance = [
  {
    id: 1,
    name: 'Creator C',
    handle: '@creatorc',
    initials: 'CC',
    reach: '9.8K',
    engagement: '14.1%',
    conversations: '1.1K',
    intent: '692',
    conversions: '286',
    conversionRate: '6.8%',
    score: 95,
  },
  {
    id: 2,
    name: 'Creator A',
    handle: '@creatora',
    initials: 'CA',
    reach: '18.4K',
    engagement: '9.2%',
    conversations: '1.8K',
    intent: '842',
    conversions: '312',
    conversionRate: '5.4%',
    score: 92,
  },
  {
    id: 3,
    name: 'Creator B',
    handle: '@creatorb',
    initials: 'CB',
    reach: '31.2K',
    engagement: '5.8%',
    conversations: '2.4K',
    intent: '611',
    conversions: '174',
    conversionRate: '2.9%',
    score: 76,
  },
  {
    id: 4,
    name: 'Creator D',
    handle: '@creatord',
    initials: 'CD',
    reach: '22.1K',
    engagement: '7.4%',
    conversations: '1.7K',
    intent: '580',
    conversions: '201',
    conversionRate: '3.5%',
    score: 81,
  },
  {
    id: 5,
    name: 'Creator E',
    handle: '@creatore',
    initials: 'CE',
    reach: '12.6K',
    engagement: '8.6%',
    conversations: '962',
    intent: '470',
    conversions: '162',
    conversionRate: '2.6%',
    score: 71,
  },
];


// ============================================================
// SECTION 5 — CAMPAIGN PERFORMANCE
// ============================================================

const campaignPerformance = [
  {
    name: 'Autumn Community Challenge',
    reach: '42.8K',
    engagement: '10.4%',
    conversion: '4.8%',
    roi: '4.2x',
    roiWidth: 72,
  },
  {
    name: 'Creator Showcase Week',
    reach: '31.4K',
    engagement: '8.7%',
    conversion: '6.2%',
    roi: '5.6x',
    roiWidth: 94,
  },
  {
    name: 'Fitness & Wellbeing Event',
    reach: '28.6K',
    engagement: '11.2%',
    conversion: '5.1%',
    roi: '4.8x',
    roiWidth: 81,
  },
  {
    name: 'Winter Gaming Campaign',
    reach: '24.2K',
    engagement: '7.1%',
    conversion: '3.2%',
    roi: '3.1x',
    roiWidth: 52,
  },
];


// ============================================================
// SECTION 6 — PLATFORM PERFORMANCE
// ============================================================

const platforms = [
  {
    label: 'Twitch',
    value: 38,
    tone: 'purple',
  },
  {
    label: 'Discord',
    value: 27,
    tone: 'blue',
  },
  {
    label: 'Project Respawn',
    value: 22,
    tone: 'green',
  },
  {
    label: 'Creator Profiles',
    value: 8,
    tone: 'gold',
  },
  {
    label: 'Other',
    value: 5,
    tone: 'grey',
  },
];


// ============================================================
// SECTION 7 — RECOMMENDED CREATORS
// ============================================================

const recommendedCreators = ref([
  {
    id: 101,
    name: 'Creator C',
    handle: '@creatorc',
    initials: 'CC',
    fit: 95,
    engagement: '14.1%',
    conversion: '6.8%',
    relationship: 'Worked together',
    reason:
      'Highest conversion efficiency across your previous campaigns.',
    selected: true,
  },
  {
    id: 102,
    name: 'Creator A',
    handle: '@creatora',
    initials: 'CA',
    fit: 92,
    engagement: '9.2%',
    conversion: '5.4%',
    relationship: 'Worked together',
    reason:
      'Strong reach with consistently above-average conversion.',
    selected: true,
  },
  {
    id: 103,
    name: 'Creator F',
    handle: '@creatorf',
    initials: 'CF',
    fit: 89,
    engagement: '11.8%',
    conversion: '5.9%',
    relationship: 'New recommendation',
    reason:
      'Audience behaviour closely matches your highest-converting communities.',
    selected: false,
  },
  {
    id: 104,
    name: 'Creator G',
    handle: '@creatorg',
    initials: 'CG',
    fit: 87,
    engagement: '8.7%',
    conversion: '4.3%',
    relationship: 'New recommendation',
    reason:
      'Strong gaming and community overlap with your campaign audience.',
    selected: false,
  },
  {
    id: 105,
    name: 'Creator B',
    handle: '@creatorb',
    initials: 'CB',
    fit: 86,
    engagement: '5.8%',
    conversion: '2.9%',
    relationship: 'Worked together',
    reason:
      'High reach and strong brand conversation volume.',
    selected: false,
  },
]);


// ============================================================
// SECTION 8 — PARTNERSHIP REQUEST
// ============================================================

const partnershipModalOpen = ref(false);

const partnershipForm = ref({
  objective: 'Brand awareness',
  activation: 'Sponsored streams',
  budget: '£10,000 – £20,000',
  startDate: '',
  endDate: '',
  notes: '',
});

const selectedCreators = computed(() => {
  return recommendedCreators.value.filter(
    (creator) => creator.selected
  );
});

const selectedCreatorCount = computed(() => {
  return selectedCreators.value.length;
});


// ============================================================
// ACTIONS
// ============================================================

function toggleCreator(creator) {
  creator.selected = !creator.selected;
}

function openPartnershipModal() {
  if (!selectedCreatorCount.value) {
    return;
  }

  partnershipModalOpen.value = true;
}

function closePartnershipModal() {
  partnershipModalOpen.value = false;
}

function submitPartnershipRequest() {
  partnershipModalOpen.value = false;

  // Demo only.
  // Backend workflow will be connected later.
  window.alert(
    'Demo partnership request submitted to Project Respawn.'
  );
}
</script>

<template>
  <div class="partner-hub">

    <!-- ======================================================
         PARTNER SIDEBAR
         ====================================================== -->

    <PartnerSidebar />

    <!-- ======================================================
         ANALYTICS PAGE
         ====================================================== -->

    <main class="partner-analytics-page">

      <!-- ====================================================
           SECTION 1 — PAGE HEADER
           ==================================================== -->

      <header class="partner-analytics-header">

        <div>

          <span class="partner-analytics-eyebrow">
            ANALYTICS
          </span>

          <h1>
            Campaign Performance
          </h1>

          <p>
            Deep insights into your campaigns, creators and
            community impact.
          </p>

        </div>


        <div class="partner-analytics-filters">

          <select v-model="selectedPeriod">
            <option value="30">
              Last 30 days
            </option>

            <option value="90">
              Last 90 days
            </option>

            <option value="365">
              Last 12 months
            </option>
          </select>


          <select v-model="selectedCampaign">
            <option value="all">
              All Campaigns
            </option>

            <option value="community">
              Community Challenge
            </option>

            <option value="creator">
              Creator Showcase
            </option>

            <option value="fitness">
              Fitness & Wellbeing
            </option>
          </select>


          <button
            type="button"
            class="partner-analytics-export"
          >
            ↓ Export Report
          </button>

        </div>

      </header>


      <!-- ====================================================
           SECTION 2 — KPI CARDS
           ==================================================== -->

      <section class="partner-analytics-kpis">

        <article
          v-for="metric in headlineMetrics"
          :key="metric.id"
          class="partner-analytics-kpi"
          :class="`analytics-${metric.tone}`"
        >

          <div class="partner-kpi-icon">
            {{ metric.icon }}
          </div>

          <div>

            <span>
              {{ metric.label }}
            </span>

            <div class="partner-kpi-value-row">

              <strong>
                {{ metric.value }}
              </strong>

              <small>
                ↑ {{ metric.change }}
              </small>

            </div>

            <small class="partner-kpi-period">
              vs previous 30 days
            </small>

          </div>

        </article>

      </section>


      <!-- ====================================================
           SECTION 3 — PRIMARY ANALYTICS
           ==================================================== -->

      <section class="partner-analytics-primary-grid">

        <!-- Engagement Funnel -->

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">
            <h2>
              Engagement Funnel
            </h2>
          </header>


          <div class="partner-engagement-funnel">

            <div
              v-for="step in funnel"
              :key="step.label"
              class="partner-funnel-row"
            >

              <div
                class="partner-funnel-bar"
                :class="`analytics-${step.tone}`"
                :style="{
                  width: `${step.width}%`,
                }"
              >

                <span>
                  {{ step.label }}
                </span>

              </div>


              <strong>
                {{ step.value }}
              </strong>


              <small>
                {{ step.percentage }}
              </small>

            </div>

          </div>


          <footer class="partner-funnel-footer">

            <span>
              Overall conversion rate
            </span>

            <strong>
              3.4%
            </strong>

          </footer>

        </article>


        <!-- Conversation vs Conversion -->

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">

            <div>
              <h2>
                Conversation vs Conversion
              </h2>

              <span>
                Community Challenge
              </span>
            </div>

          </header>


          <div class="partner-conversion-panel-content">

            <div class="partner-conversion-ring">

              <div>
                <strong>
                  29.3%
                </strong>

                <span>
                  Conversation → Conversion
                </span>
              </div>

            </div>


            <div class="partner-conversion-details">

              <div>
                <span>
                  Brand conversations
                </span>

                <strong>
                  3,842
                </strong>
              </div>

              <div>
                <span>
                  Positive sentiment
                </span>

                <strong>
                  81%
                </strong>
              </div>

              <div>
                <span>
                  High intent interactions
                </span>

                <strong>
                  2,160
                </strong>
              </div>

              <div>
                <span>
                  Conversions
                </span>

                <strong>
                  1,126
                </strong>
              </div>

            </div>

          </div>


          <div class="partner-analytics-insight">

            <strong>
              ✦ High conversation, lower conversion
            </strong>

            <p>
              Your campaign generated 42% more brand discussion
              than average, but conversion was 18% below comparable
              campaigns.
            </p>

          </div>

        </article>


        <!-- Engagement by Platform -->

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">
            <h2>
              Engagement by Platform
            </h2>
          </header>


          <div class="partner-platform-content">

            <div class="partner-platform-donut">
              <div />
            </div>


            <div class="partner-platform-list">

              <div
                v-for="platform in platforms"
                :key="platform.label"
              >

                <span
                  class="partner-platform-dot"
                  :class="`analytics-${platform.tone}`"
                />

                <span>
                  {{ platform.label }}
                </span>

                <strong>
                  {{ platform.value }}%
                </strong>

              </div>

            </div>

          </div>


          <div class="partner-platform-insight">
            Discord drove the highest conversation rate while
            Project Respawn generated the most measurable
            conversions.
          </div>

        </article>

      </section>


      <!-- ====================================================
           SECTION 4 — CREATOR PERFORMANCE
           ==================================================== -->

      <section class="partner-analytics-secondary-grid">

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">

            <h2>
              Creator Performance
            </h2>

          </header>


          <div class="partner-creator-table-wrapper">

            <table class="partner-creator-table">

              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Reach</th>
                  <th>Engagement</th>
                  <th>Conversations</th>
                  <th>Intent</th>
                  <th>Conversions</th>
                  <th>Conv. Rate</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>

                <tr
                  v-for="creator in creatorPerformance"
                  :key="creator.id"
                >

                  <td>

                    <div class="partner-creator-table-person">

                      <div class="partner-creator-avatar">
                        {{ creator.initials }}
                      </div>

                      <div>
                        <strong>
                          {{ creator.name }}
                        </strong>

                        <span>
                          {{ creator.handle }}
                        </span>
                      </div>

                    </div>

                  </td>

                  <td>
                    {{ creator.reach }}
                  </td>

                  <td class="analytics-positive">
                    {{ creator.engagement }}
                  </td>

                  <td>
                    {{ creator.conversations }}
                  </td>

                  <td>
                    {{ creator.intent }}
                  </td>

                  <td>
                    {{ creator.conversions }}
                  </td>

                  <td class="analytics-positive">
                    {{ creator.conversionRate }}
                  </td>

                  <td>

                    <span class="partner-performance-score">
                      {{ creator.score }}
                    </span>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          <button
            type="button"
            class="partner-analytics-text-action"
          >
            View full creator performance →
          </button>

        </article>


        <!-- Campaign Performance -->

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">
            <h2>
              Campaign Performance
            </h2>
          </header>


          <div class="partner-campaign-performance-table">

            <div class="partner-campaign-performance-head">

              <span>Campaign</span>
              <span>Reach</span>
              <span>Eng.</span>
              <span>Conversion</span>
              <span>ROI</span>

            </div>


            <div
              v-for="campaign in campaignPerformance"
              :key="campaign.name"
              class="partner-campaign-performance-row"
            >

              <strong>
                {{ campaign.name }}
              </strong>

              <span>
                {{ campaign.reach }}
              </span>

              <span>
                {{ campaign.engagement }}
              </span>

              <span class="analytics-positive">
                {{ campaign.conversion }}
              </span>

              <div class="partner-roi-cell">

                <strong>
                  {{ campaign.roi }}
                </strong>

                <div>
                  <span
                    :style="{
                      width: `${campaign.roiWidth}%`,
                    }"
                  />
                </div>

              </div>

            </div>

          </div>


          <button
            type="button"
            class="partner-analytics-text-action"
          >
            View all campaigns →
          </button>

        </article>


        <!-- Sentiment -->

        <article class="partner-analytics-panel">

          <header class="partner-analytics-panel-header">
            <h2>
              Community Sentiment
            </h2>
          </header>


          <div class="partner-sentiment-content">

            <div class="partner-sentiment-gauge">
              <span>
                ☺
              </span>
            </div>


            <div class="partner-sentiment-values">

              <div class="sentiment-positive">
                <strong>
                  72%
                </strong>

                <span>
                  Positive
                </span>
              </div>

              <div class="sentiment-neutral">
                <strong>
                  21%
                </strong>

                <span>
                  Neutral
                </span>
              </div>

              <div class="sentiment-negative">
                <strong>
                  7%
                </strong>

                <span>
                  Negative
                </span>
              </div>

            </div>

          </div>


          <p class="partner-sentiment-note">
            Overall sentiment across 3,842 brand-related
            conversations.
          </p>

        </article>

      </section>


      <!-- ====================================================
           SECTION 5 — RECOMMENDED CREATORS
           ==================================================== -->

      <section class="partner-recommended-creators">

        <header class="partner-recommended-header">

          <div>

            <h2>
              Recommended Creators
            </h2>

            <p>
              Creators your brand may want to work with next,
              based on performance and audience fit.
            </p>

          </div>

        </header>


        <div class="partner-recommended-layout">

          <!-- Creator Carousel -->

          <div class="partner-recommended-carousel">

            <article
              v-for="creator in recommendedCreators"
              :key="creator.id"
              class="partner-recommended-card"
              :class="{
                'partner-recommended-card-selected':
                  creator.selected,
              }"
            >

              <button
                type="button"
                class="partner-creator-select"
                :class="{
                  'partner-creator-select-active':
                    creator.selected,
                }"
                :aria-label="
                  creator.selected
                    ? `Remove ${creator.name}`
                    : `Select ${creator.name}`
                "
                @click="toggleCreator(creator)"
              >
                {{ creator.selected ? '✓' : '+' }}
              </button>


              <div class="partner-recommended-avatar">
                {{ creator.initials }}
              </div>


              <div class="partner-recommended-name">

                <strong>
                  {{ creator.name }}
                </strong>

                <span>
                  {{ creator.handle }}
                </span>

              </div>


              <span class="partner-brand-fit">
                {{ creator.fit }}% Brand Fit
              </span>


              <div class="partner-recommended-stats">

                <div>
                  <strong>
                    {{ creator.engagement }}
                  </strong>

                  <span>
                    Engagement
                  </span>
                </div>

                <div>
                  <strong>
                    {{ creator.conversion }}
                  </strong>

                  <span>
                    Conversion
                  </span>
                </div>

              </div>


              <div class="partner-recommended-relationship">

                <span>
                  {{
                    creator.relationship === 'Worked together'
                      ? '✦'
                      : '★'
                  }}
                </span>

                {{ creator.relationship }}

              </div>


              <p>
                {{ creator.reason }}
              </p>


              <button
                type="button"
                class="partner-view-creator-button"
              >
                View Profile
              </button>

            </article>

          </div>


          <!-- Project Respawn Negotiation Panel -->

          <aside class="partner-negotiation-panel">

            <div class="partner-negotiation-icon">
              ◇
            </div>

            <h3>
              We handle the negotiation
            </h3>

            <p>
              Our team will discuss availability, pricing and
              deliverables with the creators on your behalf.
            </p>


            <ul>
              <li>
                ✓ You tell us your goals and budget
              </li>

              <li>
                ✓ We handle creator negotiations
              </li>

              <li>
                ✓ We build the right creator package
              </li>

              <li>
                ✓ You approve before anything proceeds
              </li>

              <li>
                ✓ We help manage the campaign
              </li>
            </ul>

          </aside>

        </div>


        <!-- Creator Selection Bar -->

        <footer class="partner-creator-selection-bar">

          <div>

            <strong>
              {{ selectedCreatorCount }}
              creator{{ selectedCreatorCount === 1 ? '' : 's' }}
              selected
            </strong>


            <div class="partner-selected-avatars">

              <span
                v-for="creator in selectedCreators"
                :key="creator.id"
              >
                {{ creator.initials }}
              </span>

            </div>

          </div>


          <button
            type="button"
            class="partner-discuss-button"
            :disabled="!selectedCreatorCount"
            @click="openPartnershipModal"
          >
            Discuss a partnership with Project Respawn →
          </button>

        </footer>

      </section>

    </main>


    <!-- ======================================================
         PARTNERSHIP REQUEST MODAL
         ====================================================== -->

    <div
      v-if="partnershipModalOpen"
      class="partner-partnership-modal-backdrop"
      @click.self="closePartnershipModal"
    >

      <section class="partner-partnership-modal">

        <header>

          <div>

            <span>
              CREATOR PARTNERSHIP
            </span>

            <h2>
              Talk to Project Respawn
            </h2>

            <p>
              Tell us what you want to achieve. Our partnerships
              team will work with the selected creators and build
              a proposal.
            </p>

          </div>


          <button
            type="button"
            aria-label="Close"
            @click="closePartnershipModal"
          >
            ×
          </button>

        </header>


        <!-- Selected creators -->

        <div class="partner-modal-selected-creators">

          <span
            v-for="creator in selectedCreators"
            :key="creator.id"
          >
            {{ creator.name }}

            <button
              type="button"
              @click="toggleCreator(creator)"
            >
              ×
            </button>
          </span>

        </div>


        <div class="partner-partnership-form">

          <label>

            <span>
              Campaign objective
            </span>

            <select v-model="partnershipForm.objective">
              <option>Brand awareness</option>
              <option>Product launch</option>
              <option>Conversions</option>
              <option>Community engagement</option>
              <option>Long-term ambassador programme</option>
            </select>

          </label>


          <label>

            <span>
              Activation type
            </span>

            <select v-model="partnershipForm.activation">
              <option>Sponsored streams</option>
              <option>Social content</option>
              <option>Product placement</option>
              <option>Event appearance</option>
              <option>Long-term partnership</option>
            </select>

          </label>


          <label>

            <span>
              Indicative budget
            </span>

            <select v-model="partnershipForm.budget">
              <option>Under £2,500</option>
              <option>£2,500 – £5,000</option>
              <option>£5,000 – £10,000</option>
              <option>£10,000 – £20,000</option>
              <option>£20,000+</option>
              <option>Let's discuss</option>
            </select>

          </label>


          <div class="partner-partnership-date-grid">

            <label>

              <span>
                Start date
              </span>

              <input
                v-model="partnershipForm.startDate"
                type="date"
              />

            </label>


            <label>

              <span>
                End date
              </span>

              <input
                v-model="partnershipForm.endDate"
                type="date"
              />

            </label>

          </div>


          <label>

            <span>
              Tell us about the campaign
            </span>

            <textarea
              v-model="partnershipForm.notes"
              rows="5"
              placeholder="What would you like the creators to do, and what would success look like?"
            />

          </label>

        </div>


        <footer>

          <button
            type="button"
            class="partner-modal-cancel"
            @click="closePartnershipModal"
          >
            Cancel
          </button>


          <button
            type="button"
            class="partner-modal-submit"
            @click="submitPartnershipRequest"
          >
            Send to Project Respawn →
          </button>

        </footer>

      </section>

    </div>

  </div>
</template>
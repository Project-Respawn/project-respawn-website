<script setup>
import { computed, ref } from 'vue';

import PartnerSidebar from '../../components/PartnerSidebar.vue';

import communityImage from '../../../../assets/partner-campaigns/community-event.png';
import creatorImage from '../../../../assets/partner-campaigns/creator-showcase.png';
import wellbeingImage from '../../../../assets/partner-campaigns/wellbeing-fitness-event.png';
import gamingImage from '../../../../assets/partner-campaigns/gaming-tournament.png';
import racingImage from '../../../../assets/partner-campaigns/racing-event.png';
import holidayImage from '../../../../assets/partner-campaigns/holiday-campaign.png';

import '../../styles/partner-hub.css';
import '../../styles/partner-campaigns.css';

// ============================================================
// PAGE STATE
// ============================================================

const campaignTab = ref('active');
const artworkLibraryOpen = ref(false);

const campaignTabs = [
  { id: 'active', label: 'Active' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

// ============================================================
// CATEGORY CONFIG
// ============================================================

const categories = {
  community: {
    label: 'Community',
    className: 'category-community',
  },

  creator: {
    label: 'Creator Programme',
    className: 'category-creator',
  },

  wellbeing: {
    label: 'Wellbeing',
    className: 'category-wellbeing',
  },

  gaming: {
    label: 'Gaming',
    className: 'category-gaming',
  },

  racing: {
    label: 'Racing',
    className: 'category-racing',
  },

  seasonal: {
    label: 'Seasonal',
    className: 'category-seasonal',
  },
};

// ============================================================
// UPCOMING EVENTS
// ============================================================

const opportunities = [
  {
    id: 1,
    day: '5',
    month: 'OCT',
    year: '2026',
    category: 'community',
    title: 'Autumn Community Challenge',

    description:
      'A community-wide challenge promoting positivity, teamwork and wellbeing.',

    image: communityImage,

    lookingFor: [
      '1 Main Partner',
      '2 Supporting Partners',
      'Creator activations available',
    ],

    action: 'View opportunity',
  },

  {
    id: 2,
    day: '18',
    month: 'NOV',
    year: '2026',
    category: 'creator',
    title: 'Creator Showcase Week',

    description:
      'Celebrate creators and their communities across Project Respawn.',

    image: creatorImage,

    lookingFor: [
      'Gaming Partner',
      'Technology Partner',
      '4 matching creators',
    ],

    action: 'Express interest',
  },

  {
    id: 3,
    day: '9',
    month: 'DEC',
    year: '2026',
    category: 'wellbeing',
    title: 'Fitness & Wellbeing Event',

    description:
      'Encouraging healthier habits through fitness, movement and mental wellbeing.',

    image: wellbeingImage,

    lookingFor: [
      'Fitness Partner',
      'Nutrition Partner',
      'Creator activations available',
    ],

    action: 'View opportunity',
  },

  {
    id: 4,
    day: '4',
    month: 'JAN',
    year: '2027',
    category: 'gaming',
    title: 'Winter Gaming Campaign',

    description:
      'A season of gaming celebrations, tournaments and community events.',

    image: gamingImage,

    lookingFor: [
      'Gaming Partner',
      'Hardware Partner',
    ],

    action: 'View opportunity',
  },
];

// ============================================================
// YOUR CAMPAIGNS
// ============================================================

const campaigns = [
  {
    id: 1,
    status: 'active',
    statusLabel: 'ACTIVE',
    category: 'community',

    title: 'Respawn Community Challenge',
    date: '12 Sep – 5 Oct 2026',

    description:
      'A community challenge focused on positivity and teamwork.',

    image: communityImage,

    creators: 6,
    reach: '12,800',
    engagement: '8.4%',

    involvement: 'Featured Partner',
    action: 'View campaign',
  },

  {
    id: 2,
    status: 'upcoming',
    statusLabel: 'UPCOMING',
    category: 'creator',

    title: 'Creator Showcase Week',
    date: '18 – 24 Nov 2026',

    description:
      'Celebrating creators and their communities.',

    image: creatorImage,

    creators: 4,
    reach: '8,400',
    engagement: '7.2%',

    involvement: 'Partner',
    action: 'View campaign',
  },

  {
    id: 3,
    status: 'completed',
    statusLabel: 'COMPLETED',
    category: 'wellbeing',

    title: 'Fitness & Wellbeing Event',
    date: '10 – 16 Aug 2026',

    description:
      'A week of fitness, wellbeing and community activations.',

    image: wellbeingImage,

    creators: 5,
    reach: '9,200',
    engagement: '6.7%',

    involvement: 'Supporting Partner',
    action: 'View results',
  },
];

// ============================================================
// SUGGESTED ARTWORK LIBRARY
// ============================================================

const suggestedArtwork = [
  {
    id: 'community',
    name: 'Community Event',
    category: 'Community',
    image: communityImage,
  },

  {
    id: 'creator',
    name: 'Creator Showcase',
    category: 'Creator Programme',
    image: creatorImage,
  },

  {
    id: 'wellbeing',
    name: 'Wellbeing & Fitness',
    category: 'Wellbeing',
    image: wellbeingImage,
  },

  {
    id: 'gaming',
    name: 'Gaming Event',
    category: 'Gaming',
    image: gamingImage,
  },

  {
    id: 'racing',
    name: 'Racing Event',
    category: 'Gaming',
    image: racingImage,
  },

  {
    id: 'holiday',
    name: 'Holiday Campaign',
    category: 'Seasonal',
    image: holidayImage,
  },
];

// ============================================================
// COMPUTED CAMPAIGNS
// ============================================================

const visibleCampaigns = computed(() => {
  return campaigns.filter(
    (campaign) => campaign.status === campaignTab.value
  );
});

// ============================================================
// HELPERS
// ============================================================

function categoryFor(id) {
  return categories[id] || categories.community;
}

function openArtworkLibrary() {
  artworkLibraryOpen.value = true;
}

function closeArtworkLibrary() {
  artworkLibraryOpen.value = false;
}
</script>

<template>
  <div class="partner-hub">

    <!-- ======================================================
         SHARED SIDEBAR
         ====================================================== -->

    <PartnerSidebar />

    <!-- ======================================================
         CAMPAIGNS PAGE
         ====================================================== -->

    <main class="partner-campaigns-page">

      <!-- ====================================================
           PAGE HEADER
           ==================================================== -->

      <header class="partner-campaigns-header">

        <div>
          <span class="partner-campaigns-eyebrow">
            PARTNER HUB
          </span>

          <h1>
            Campaigns
          </h1>

          <p>
            Plan activations, join upcoming opportunities and
            track your campaigns.
          </p>
        </div>


        <div class="partner-campaign-header-actions">

          <button
            type="button"
            class="partner-artwork-library-button"
            @click="openArtworkLibrary"
          >
            Suggested artwork
          </button>

          <RouterLink
            to="/partners/ravens-gaming"
            class="partner-outline-button"
          >
            View public profile ↗
          </RouterLink>

        </div>

      </header>


      <!-- ====================================================
           SECTION 1 — UPCOMING EVENTS & OPPORTUNITIES
           ==================================================== -->

      <section class="partner-campaigns-section">

        <div class="partner-campaigns-section-header">

          <div class="partner-section-heading">

            <div class="partner-section-icon">
              ◫
            </div>

            <div>
              <h2>
                Upcoming Events &amp; Opportunities
              </h2>

              <p>
                Upcoming Project Respawn events and activations
                your brand can be part of.
              </p>
            </div>

          </div>

          <button
            type="button"
            class="partner-campaigns-link"
          >
            View all opportunities →
          </button>

        </div>


        <div class="partner-opportunities-grid">

          <article
            v-for="opportunity in opportunities"
            :key="opportunity.id"
            class="partner-opportunity-campaign-card"
            :class="categoryFor(opportunity.category).className"
          >

            <!-- ==================================================
                 EVENT IMAGE
                 ================================================== -->

            <div
              class="partner-opportunity-visual"
              :style="{
                backgroundImage:
                  `linear-gradient(to bottom, rgba(5,8,15,0.05), rgba(5,8,15,0.94)), url(${opportunity.image})`
              }"
            >

              <div class="partner-opportunity-date">

                <strong>
                  {{ opportunity.day }}
                </strong>

                <span>
                  {{ opportunity.month }}
                </span>

                <small>
                  {{ opportunity.year }}
                </small>

              </div>


              <span class="partner-opportunity-type">
                {{ categoryFor(opportunity.category).label }}
              </span>


              <div class="partner-opportunity-visual-content">

                <h3>
                  {{ opportunity.title }}
                </h3>

                <p>
                  {{ opportunity.description }}
                </p>

              </div>

            </div>


            <!-- ==================================================
                 OPPORTUNITY DETAILS
                 ================================================== -->

            <div class="partner-opportunity-details">

              <span class="partner-opportunity-looking">
                Looking for:
              </span>

              <ul>

                <li
                  v-for="item in opportunity.lookingFor"
                  :key="item"
                >
                  <span aria-hidden="true">
                    ◈
                  </span>

                  {{ item }}
                </li>

              </ul>


              <button
                type="button"
                class="partner-opportunity-button"
              >
                {{ opportunity.action }}
              </button>

            </div>

          </article>

        </div>

      </section>


      <!-- ====================================================
           SECTION 2 — YOUR CAMPAIGNS
           ==================================================== -->

      <section class="partner-campaigns-section">

        <div class="partner-campaigns-section-header">

          <div class="partner-section-heading">

            <div class="partner-section-icon">
              ♧
            </div>

            <div>
              <h2>
                Your Campaigns
              </h2>

              <p>
                Campaigns your brand is participating in with
                Project Respawn.
              </p>
            </div>

          </div>

          <button
            type="button"
            class="partner-campaigns-link"
          >
            View all campaigns →
          </button>

        </div>


        <!-- ==================================================
             CAMPAIGN TABS
             ================================================== -->

        <div class="partner-campaign-tabs">

          <button
            v-for="tab in campaignTabs"
            :key="tab.id"
            type="button"
            class="partner-campaign-tab"
            :class="{
              'partner-campaign-tab-active':
                campaignTab === tab.id,
            }"
            @click="campaignTab = tab.id"
          >
            {{ tab.label }}
          </button>

        </div>


        <!-- ==================================================
             CAMPAIGN CARDS
             ================================================== -->

        <div class="partner-campaign-cards">

          <article
            v-for="campaign in visibleCampaigns"
            :key="campaign.id"
            class="partner-owned-campaign-card"
            :class="categoryFor(campaign.category).className"
          >

            <!-- Campaign Artwork -->

            <div
              class="partner-owned-campaign-art"
              :style="{
                backgroundImage:
                  `linear-gradient(to bottom, rgba(5,8,15,0.04), rgba(5,8,15,0.88)), url(${campaign.image})`
              }"
            />


            <!-- Campaign Information -->

            <div class="partner-owned-campaign-info">

              <span
                class="partner-owned-campaign-status"
                :class="`partner-status-${campaign.status}`"
              >
                {{ campaign.statusLabel }}
              </span>

              <h3>
                {{ campaign.title }}
              </h3>

              <span class="partner-owned-campaign-date">
                ◫ {{ campaign.date }}
              </span>

              <p>
                {{ campaign.description }}
              </p>

            </div>


            <!-- Campaign Metrics -->

            <div class="partner-owned-campaign-metrics">

              <div>
                <span>Creators</span>

                <strong>
                  {{ campaign.creators }}
                </strong>
              </div>

              <div>
                <span>Reach</span>

                <strong>
                  {{ campaign.reach }}
                </strong>
              </div>

              <div>
                <span>Engagement</span>

                <strong>
                  {{ campaign.engagement }}
                </strong>
              </div>

            </div>


            <!-- Campaign Footer -->

            <div class="partner-owned-campaign-footer">

              <span>
                Your involvement:

                <strong>
                  {{ campaign.involvement }}
                </strong>
              </span>

              <button
                type="button"
                class="partner-owned-campaign-button"
              >
                {{ campaign.action }}
              </button>

            </div>

          </article>


          <div
            v-if="!visibleCampaigns.length"
            class="partner-campaign-empty-state"
          >
            <strong>
              No {{ campaignTab }} campaigns
            </strong>

            <span>
              Campaigns will appear here when available.
            </span>
          </div>

        </div>

      </section>


      <!-- ====================================================
           SECTION 3 — CAMPAIGN IDEA
           ==================================================== -->

      <section class="partner-campaign-idea">

        <div class="partner-campaign-idea-icon">
          ✦
        </div>


        <div class="partner-campaign-idea-copy">

          <h2>
            Have an idea for a campaign?
          </h2>

          <p>
            Work with Project Respawn to create a campaign that
            connects with gaming communities and drives meaningful
            engagement.
          </p>

        </div>


        <div class="partner-campaign-process">

          <div>
            <span class="partner-campaign-process-icon">
              1
            </span>

            <div>
              <strong>
                Share your idea
              </strong>

              <p>
                Tell us your goals, audience and the impact
                you want to create.
              </p>
            </div>
          </div>


          <div>
            <span class="partner-campaign-process-icon">
              2
            </span>

            <div>
              <strong>
                We review &amp; plan
              </strong>

              <p>
                We'll look at creator fit, timing and activation
                opportunities.
              </p>
            </div>
          </div>


          <div>
            <span class="partner-campaign-process-icon">
              3
            </span>

            <div>
              <strong>
                Launch together
              </strong>

              <p>
                We'll collaborate to launch the campaign and
                track results.
              </p>
            </div>
          </div>

        </div>


        <div class="partner-campaign-submit">

          <button
            type="button"
            class="partner-campaign-submit-button"
          >
            Submit campaign idea →
          </button>

          <span>
            We'll be in touch within 5 working days.
          </span>

        </div>

      </section>

    </main>


    <!-- ======================================================
         ARTWORK LIBRARY OVERLAY
         ====================================================== -->

    <Transition name="partner-drawer-fade">

      <button
        v-if="artworkLibraryOpen"
        type="button"
        class="partner-artwork-backdrop"
        aria-label="Close artwork library"
        @click="closeArtworkLibrary"
      />

    </Transition>


    <!-- ======================================================
         SUGGESTED ARTWORK DRAWER
         ====================================================== -->

    <Transition name="partner-drawer-slide">

      <aside
        v-if="artworkLibraryOpen"
        class="partner-artwork-drawer"
      >

        <header class="partner-artwork-drawer-header">

          <div>
            <span>
              CAMPAIGN TOOLS
            </span>

            <h2>
              Event Artwork
            </h2>

            <p>
              Upload your own image or choose suggested
              Project Respawn artwork.
            </p>
          </div>

          <button
            type="button"
            class="partner-artwork-close"
            aria-label="Close artwork library"
            @click="closeArtworkLibrary"
          >
            ×
          </button>

        </header>


        <!-- ==================================================
             UPLOAD YOUR OWN
             ================================================== -->

        <section class="partner-artwork-upload">

          <span class="partner-artwork-section-label">
            YOUR IMAGE
          </span>

          <div class="partner-artwork-upload-box">

            <strong>
              Upload campaign artwork
            </strong>

            <p>
              PNG, JPG or WebP. Landscape images work best.
            </p>

            <button type="button">
              Choose image
            </button>

          </div>

        </section>


        <!-- ==================================================
             SUGGESTED IMAGES
             ================================================== -->

        <section class="partner-artwork-suggestions">

          <span class="partner-artwork-section-label">
            SUGGESTED ARTWORK
          </span>

          <p class="partner-artwork-description">
            Choose one of these images as a starting point for
            your event.
          </p>


          <div class="partner-artwork-grid">

            <button
              v-for="artwork in suggestedArtwork"
              :key="artwork.id"
              type="button"
              class="partner-artwork-card"
            >

              <img
                :src="artwork.image"
                :alt="artwork.name"
              />

              <div>
                <strong>
                  {{ artwork.name }}
                </strong>

                <span>
                  {{ artwork.category }}
                </span>
              </div>

            </button>

          </div>

        </section>


        <!-- ==================================================
             CATEGORY INFORMATION
             ================================================== -->

        <section class="partner-artwork-category-guide">

          <span class="partner-artwork-section-label">
            CATEGORY COLOURS
          </span>

          <p>
            Your selected event category automatically controls
            the card accent colour, badge and buttons even when
            custom artwork is uploaded.
          </p>


          <div class="partner-category-guide-grid">

            <span class="category-community">
              Community
            </span>

            <span class="category-creator">
              Creator
            </span>

            <span class="category-wellbeing">
              Wellbeing
            </span>

            <span class="category-gaming">
              Gaming
            </span>

          </div>

        </section>

      </aside>

    </Transition>

  </div>
</template>